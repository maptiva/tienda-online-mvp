/**
 * 📦 Script para recomprimir imágenes existentes en el storage (TypeScript)
 * ======================================================================
 * 1. Obtiene productos
 * 2. Descarga imágenes
 * 3. Comprime si > 375KB
 * 4. Actualiza en Storage y DB
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Credenciales faltantes.');
    process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const BUCKET_NAME = 'product-images';
const SIZE_LIMIT_MB = 0.375;

interface CompressionResult {
    success: boolean;
    skipped?: boolean;
    reason?: string;
    newUrl?: string;
    originalSize?: string;
    newSize?: string;
    savings?: string;
}

const compressionOptions = {
    maxSizeMB: 0.25,
    maxWidthOrHeight: 1200,
    useWebWorker: false, // Cambiado a false para entorno Node
    fileType: 'image/webp',
    initialQuality: 0.80,
};

async function downloadImage(url: string): Promise<File | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const blob = new Blob([buffer], { type: contentType });
        return new File([blob], 'image.tmp', { type: contentType });
    } catch (error) {
        console.error(`❌ Error descargando ${url}:`, (error as Error).message);
        return null;
    }
}

async function processImage(productId: string, imageUrl: string): Promise<CompressionResult> {
    if (!imageUrl || !imageUrl.includes(BUCKET_NAME)) {
        return { success: false, reason: 'URL no válida o externa' };
    }

    const file = await downloadImage(imageUrl);
    if (!file) return { success: false, reason: 'Descarga fallida' };

    const originalKB = (file.size / 1024).toFixed(1);
    if (file.size <= SIZE_LIMIT_MB * 1024 * 1024) {
        return { success: true, skipped: true };
    }

    try {
        const compressedFile = await imageCompression(file, compressionOptions);
        const compressedKB = (compressedFile.size / 1024).toFixed(1);
        const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1);

        const storagePath = imageUrl.split(`/${BUCKET_NAME}/`)[1].split('?')[0];
        
        await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
        const { data, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, compressedFile, {
            contentType: 'image/webp',
            upsert: true
        });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

        return {
            success: true,
            newUrl: publicUrlData.publicUrl,
            originalSize: originalKB,
            newSize: compressedKB,
            savings
        };
    } catch (e: any) {
        return { success: false, reason: e.message };
    }
}

async function main() {
    console.log('🚀 Iniciando Recompresión Diamond... 💎');
    const { data: products, error } = await supabase.from('products').select('id, image_url, gallery_images');
    if (error) {
        console.error('❌ Error obteniendo productos:', error.message);
        return;
    }

    for (const prod of products) {
        if (prod.image_url) {
            const res = await processImage(prod.id, prod.image_url);
            if (res.success && res.newUrl) {
                await supabase.from('products').update({ image_url: res.newUrl }).eq('id', prod.id);
                console.log(`✅ Imagen principal actualizada (${res.savings}% ahorro)`);
            }
        }
    }
}

main();