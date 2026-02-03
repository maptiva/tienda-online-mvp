import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

/**
 * SCRIPT DE LIMPIEZA PROFUNDA DE STORAGE
 * Compara base de datos vs storage y elimina lo que no se usa.
 */

// 1. Cargar configuración desde .env.development
const envPath = path.resolve(process.cwd(), '.env.development');
const envContent = fs.readFileSync(envPath, 'utf-8');

const getConfig = (key) => {
    const match = envContent.match(new RegExp(`${key}="(.*)"`));
    return match ? match[1] : null;
};

const SUPABASE_URL = getConfig('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getConfig('VITE_SUPABASE_ANON_KEY');
// Intentar obtener la service role key (opcional pero recomendada para el script)
const SUPABASE_SERVICE_KEY = getConfig('SUPABASE_SERVICE_ROLE_KEY');

const FINAL_KEY = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !FINAL_KEY) {
    console.error('❌ No se encontraron las credenciales en .env.development');
    process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
    console.warn('⚠️  AVISO: No se encontró SUPABASE_SERVICE_ROLE_KEY. Usando Anon Key (el borrado podría fallar por RLS).');
} else {
    console.log('🛡️  Usando Service Role Key (RLS bypass activo).');
}

const supabase = createClient(SUPABASE_URL, FINAL_KEY);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Utilidad para extraer path de la URL (igual a storageUtils.js)
const getStoragePath = (url, bucketName) => {
    if (!url || typeof url !== 'string') return null;
    const parts = url.split(`/${bucketName}/`);
    return parts.length < 2 ? null : parts[1].split('?')[0];
};

async function cleanup() {
    console.log('🔍 Iniciando auditoría de Supabase Storage...');
    console.log(`📡 URL: ${SUPABASE_URL}`);

    try {
        // 2. Obtener TODAS las imágenes referenciadas en la DB
        console.log('\n--- 1. Consultando Base de Datos ---');

        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('image_url, gallery_images');

        if (prodError) throw prodError;

        const { data: stores, error: storeError } = await supabase
            .from('stores')
            .select('logo_url');

        if (storeError) throw storeError;

        const registeredProductPaths = new Set();
        const registeredLogoPaths = new Set();

        products.forEach(p => {
            if (p.image_url) {
                const path = getStoragePath(p.image_url, 'product-images');
                if (path) registeredProductPaths.add(path);
            }
            if (p.gallery_images && Array.isArray(p.gallery_images)) {
                p.gallery_images.forEach(url => {
                    const path = getStoragePath(url, 'product-images');
                    if (path) registeredProductPaths.add(path);
                });
            }
        });

        stores.forEach(s => {
            if (s.logo_url) {
                const path = getStoragePath(s.logo_url, 'store-logos');
                if (path) registeredLogoPaths.add(path);
            }
        });

        console.log(`✅ Referencias encontradas: ${registeredProductPaths.size} productos/galería, ${registeredLogoPaths.size} logos.`);

        // 3. Listar archivos físicos en Storage
        console.log('\n--- 2. Listando Archivos en Storage ---');

        const listAllFiles = async (bucket) => {
            // Nota: list() de Supabase suele tener límites de paginación de 100, 
            // pero para este MVP manejamos volúmenes bajos.
            // Si hubiera miles, habría que usar recursión/paginación aquí.

            const getAllItems = async (folder = '') => {
                const { data, error } = await supabase.storage.from(bucket).list(folder);
                if (error) throw error;

                let files = [];
                for (const item of data) {
                    if (item.id === null) { // Es una carpeta (id null en list())
                        const subFiles = await getAllItems(folder ? `${folder}/${item.name}` : item.name);
                        files = [...files, ...subFiles];
                    } else {
                        files.push(folder ? `${folder}/${item.name}` : item.name);
                    }
                }
                return files;
            };

            return await getAllItems();
        };

        const physicalProductFiles = await listAllFiles('product-images');
        const physicalLogoFiles = await listAllFiles('store-logos');

        console.log(`✅ Archivos físicos: ${physicalProductFiles.length} en product-images, ${physicalLogoFiles.length} en store-logos.`);

        // 4. Identificar huérfanos
        const orphanProducts = physicalProductFiles.filter(f => !registeredProductPaths.has(f));
        const orphanLogos = physicalLogoFiles.filter(f => !registeredLogoPaths.has(f));

        console.log('\n--- 3. Resultado de Auditoría ---');
        if (orphanProducts.length === 0 && orphanLogos.length === 0) {
            console.log('✨ ¡Felicidades! No se encontraron archivos huérfanos.');
            process.exit(0);
        }

        if (orphanProducts.length > 0) {
            console.log(`🗑️  Huérfanos en product-images (${orphanProducts.length}):`);
            orphanProducts.forEach(f => console.log(`   - ${f}`));
        }

        if (orphanLogos.length > 0) {
            console.log(`🗑️  Huérfanos en store-logos (${orphanLogos.length}):`);
            orphanLogos.forEach(f => console.log(`   - ${f}`));
        }

        console.log('\n⚠️  ¡ATENCIÓN! Estos archivos están en el storage pero NO en la base de datos.');
        const confirm = await askQuestion('\n¿Deseas ELIMINAR estos archivos permanentemente? (escriba "SI" para confirmar): ');

        if (confirm === 'SI') {
            console.log('\n🚀 Iniciando eliminación...');

            const processDeletion = async (bucket, list) => {
                if (list.length === 0) return;
                console.log(`📦 Procesando bucket: ${bucket}...`);
                const { data, error } = await supabase.storage.from(bucket).remove(list);

                if (error) {
                    console.error(`❌ Error al borrar archivos de ${bucket}:`, error.message);
                } else if (data) {
                    console.log(`✅ Se eliminaron ${data.length} de ${list.length} archivos solicitados.`);
                    if (data.length < list.length) {
                        console.warn(`⚠️  ${list.length - data.length} archivos no pudieron eliminarse (revisa políticas RLS).`);
                    }
                }
            };

            await processDeletion('product-images', orphanProducts);
            await processDeletion('store-logos', orphanLogos);

            console.log('\n🎉 ¡Proceso de limpieza completado!');
        } else {
            console.log('\n❌ Operación cancelada por el usuario. No se borró nada.');
        }

    } catch (err) {
        console.error('\n💥 Error fatal durante la limpieza:', err.message);
        if (err.message.includes('permission')) {
            console.log('💡 Tip: Parece que necesitas permisos para listar el bucket. Verifica las políticas RLS en Supabase Dashboard.');
        }
    } finally {
        rl.close();
    }
}

cleanup();
