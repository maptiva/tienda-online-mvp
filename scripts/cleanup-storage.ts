/**
 * 🚿 Script de Limpieza Profunda de Storage (TypeScript)
 * Compara base de datos vs storage y elimina lo que no se usa.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
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

const getStoragePath = (url: string | null, bucketName: string): string | null => {
    if (!url) return null;
    const parts = url.split(`/${bucketName}/`);
    return parts.length < 2 ? null : parts[1].split('?')[0];
};

async function main() {
    console.log('🚿 Iniciando Limpieza Profunda (TS)...');
    
    try {
        const { data: products } = await supabase.from('products').select('image_url, gallery_images');
        const { data: stores } = await supabase.from('stores').select('logo_url');

        const inUse = new Set<string>();
        products?.forEach(p => {
            const p1 = getStoragePath(p.image_url, 'product-images');
            if (p1) inUse.add(p1);
            if (p.gallery_images && Array.isArray(p.gallery_images)) {
                p.gallery_images.forEach((u: string) => {
                    const p2 = getStoragePath(u, 'product-images');
                    if (p2) inUse.add(p2);
                });
            }
        });

        stores?.forEach(s => {
            const path = getStoragePath(s.logo_url, 'store-logos');
            if (path) inUse.add(path);
        });

        console.log(`✅ Referencias encontradas: ${inUse.size}`);
        // Resto de la lógica de listado y borrado...
    } catch (e: any) {
        console.error('❌ Error:', e.message);
    }
}

main();