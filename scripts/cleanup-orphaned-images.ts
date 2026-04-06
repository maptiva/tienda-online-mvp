/**
 * 🧹 Script de Limpieza Segura de Imágenes Huérfanas (TypeScript)
 * 
 * Este script identifica y elimina imágenes en Supabase Storage que NO están
 * siendo usadas por ningún producto en la base de datos.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Faltan variables de entorno.');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(supabaseUrl, serviceRoleKey);

function extractFileName(url: string | null): string | null {
    if (!url) return null;
    const parts = url.split('/product-images/');
    return parts.length > 1 ? parts[1] : null;
}

async function getUsedImageUrls(): Promise<Set<string>> {
    console.log('📋 Obteniendo lista de imágenes en uso...');
    const { data: products, error } = await supabase.from('products').select('image_url');
    if (error) throw new Error(`Error al obtener productos: ${error.message}`);

    const usedUrls = new Set<string>();
    products.forEach(product => {
        const fileName = extractFileName(product.image_url);
        if (fileName) usedUrls.add(fileName);
    });
    console.log(`✅ Encontradas ${usedUrls.size} imágenes en uso`);
    return usedUrls;
}

async function getUsedLogoUrls(): Promise<Set<string>> {
    console.log('📋 Obteniendo lista de logos en uso...');
    const { data: stores, error } = await supabase.from('stores').select('logo_url');
    if (error) throw new Error(`Error al obtener tiendas: ${error.message}`);

    const usedUrls = new Set<string>();
    stores.forEach(store => {
        const fileName = extractFileName(store.logo_url);
        if (fileName) usedUrls.add(fileName);
    });
    console.log(`✅ Encontrados ${usedUrls.size} logos en uso`);
    return usedUrls;
}

function askConfirmation(question: string): Promise<boolean> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'y');
        });
    });
}

async function main() {
    console.log('🧹 Script de Limpieza de Imágenes (TS)\n');
    const isDeleteMode = process.argv.includes('--delete');

    try {
        const usedImages = await getUsedImageUrls();
        const usedLogos = await getUsedLogoUrls();
        const { data: files, error } = await supabase.storage.from('product-images').list();

        if (error) throw error;
        
        const allUsed = new Set([...usedImages, ...usedLogos]);
        const orphaned = files.filter(f => !allUsed.has(f.name));

        if (orphaned.length === 0) {
            console.log('✅ No hay archivos huérfanos.');
            return;
        }

        console.log(`\n🗑️  Huérfanos detectados: ${orphaned.length}`);
        if (!isDeleteMode) {
            console.log('⚠️  Modo análisis. Usa --delete para eliminar.');
            return;
        }

        const confirmed = await askConfirmation('¿Eliminar permanentemente? (s/n): ');
        if (confirmed) {
            const { error: delError } = await supabase.storage.from('product-images').remove(orphaned.map(f => f.name));
            if (delError) throw delError;
            console.log('✅ Archivos eliminados.');
        }
    } catch (e: any) {
        console.error('❌ Error:', e.message);
    }
}

main();