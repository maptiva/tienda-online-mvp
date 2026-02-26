/**
 * Script para recomprimir imágenes existentes en el storage de Supabase.
 * 
 * Uso: node scripts/compress-existing-images.js
 * 
 * Este script:
 * 1. Obtiene todos los productos con sus URLs de imagen
 * 2. Descarga cada imagen
 * 3. Si supera 375KB, la comprime usando la nueva configuración
 * 4. La resubió al storage
 * 5. Actualiza la URL en la base de datos
 */

import { createClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Necesario para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde archivo .env en la carpeta scripts
const envPath = path.join(__dirname, 'compress-existing-images.env');
dotenv.config({ path: envPath });

// Configuración - obtener del .env.local
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Faltan variables de entorno');
    console.log('Ejecuta con:');
    console.log('  VITE_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/compress-existing-images.js');
    process.exit(1);
}

// Cliente de Supabase con clave de servicio (para escribir en storage y DB)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        persistSession: false
    }
});

const BUCKET_NAME = 'product-images';
const SIZE_LIMIT_MB = 0.375; // 375KB
const DRY_RUN = process.argv.includes('--dry-run'); // Usar --dry-run para simular sin hacer cambios

// Opciones de compresión (las mismas que el frontend)
const compressionOptions = {
    maxSizeMB: 0.25,            // 250KB objetivo
    maxWidthOrHeight: 1200,     // 1200px máx
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.80,
};

/**
 * Descarga una imagen desde una URL pública
 */
async function downloadImage(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const extension = contentType.includes('png') ? 'png' : 'jpg';

        // Crear un objeto File simulado
        const file = new File([buffer], `image.${extension}`, { type: contentType });
        return file;
    } catch (error) {
        console.error(`❌ Error descargando ${url}:`, error.message);
        return null;
    }
}

/**
 * Sube una imagen comprimida al storage
 */
async function uploadImage(file, storagePath) {
    try {
        // Primero intentar eliminar la imagen existente
        await supabase.storage.from(BUCKET_NAME).remove([storagePath]);

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, file, {
                contentType: file.type,
                upsert: true
            });

        if (error) throw error;

        // Obtener URL pública
        const { data: publicUrl } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path);

        return publicUrl.publicUrl;
    } catch (error) {
        console.error(`❌ Error subiendo ${storagePath}:`, error.message);
        return null;
    }
}

/**
 * Procesa una imagen: descarga, comprime si es necesario, y resubía
 */
async function processImage(productId, imageUrl, isGallery = false) {
    if (!imageUrl || typeof imageUrl !== 'string') {
        return { success: false, reason: 'URL inválida' };
    }

    // Extraer el path del storage
    const pathParts = imageUrl.split(`/${BUCKET_NAME}/`);
    if (pathParts.length < 2) {
        return { success: false, reason: 'No es URL de Supabase' };
    }

    const storagePath = pathParts[1].split('?')[0];
    const originalSizeKB = 0; // No podemos saber el tamaño original sin descargarlo

    console.log(`\n📷 Procesando: ${storagePath}`);

    // Descargar imagen
    const file = await downloadImage(imageUrl);
    if (!file) {
        return { success: false, reason: 'Error al descargar' };
    }

    const originalSizeKBCalc = (file.size / 1024).toFixed(1);
    console.log(`   Tamaño original: ${originalSizeKBCalc}KB`);

    // Verificar si necesita compresión
    const sizeLimitBytes = SIZE_LIMIT_MB * 1024 * 1024;

    if (file.size <= sizeLimitBytes) {
        console.log(`   ✅ Ya está dentro del límite (${SIZE_LIMIT_MB * 1024}KB), se omite`);
        return { success: true, skipped: true };
    }

    console.log(`   ⚠️  Supera el límite (${SIZE_LIMIT_MB * 1024}KB), comprimiendo...`);

    try {
        // Comprimir imagen
        const compressedFile = await imageCompression(file, compressionOptions);
        const compressedSizeKB = (compressedFile.size / 1024).toFixed(1);
        const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1);

        console.log(`   📦 Comprimida: ${compressedSizeKB}KB (ahorro: ${savings}%)`);

        // Subir imagen comprimida (solo si no es dry-run)
        if (DRY_RUN) {
            console.log(`   🔍 [SIMULACIÓN] Se subiría imagen comprimida (${compressedSizeKB}KB)`);
            const simulatedUrl = imageUrl.replace(/\?.*$/, '') + '?compressed=1';
            return {
                success: true,
                newUrl: simulatedUrl,
                originalSize: originalSizeKBCalc,
                newSize: compressedSizeKB,
                savings
            };
        }

        const newUrl = await uploadImage(compressedFile, storagePath);

        if (!newUrl) {
            return { success: false, reason: 'Error al subir' };
        }

        console.log(`   ✅ Nueva URL: ${newUrl.substring(0, 80)}...`);

        return {
            success: true,
            newUrl,
            originalSize: originalSizeKBCalc,
            newSize: compressedSizeKB,
            savings
        };

    } catch (error) {
        console.error(`   ❌ Error compressing:`, error.message);
        return { success: false, reason: error.message };
    }
}

/**
 * Función principal
 */
async function main() {
    console.log('🚀 Iniciando recompresión de imágenes existentes...\n');
    console.log(`   Límite: ${SIZE_LIMIT_MB * 1024}KB`);
    console.log(`   Bucket: ${BUCKET_NAME}`);

    if (DRY_RUN) {
        console.log('\n⚠️  MODO SIMULACIÓN - No se realizarán cambios\n');
    }

    // 1. Obtener todos los productos
    console.log('📋 Obteniendo productos de la base de datos...');

    const { data: products, error } = await supabase
        .from('products')
        .select('id, image_url, gallery_images');

    if (error) {
        console.error('❌ Error al obtener productos:', error.message);
        process.exit(1);
    }

    console.log(`   Encontrados: ${products.length} productos\n`);

    let processed = 0;
    let success = 0;
    let skipped = 0;
    let failed = 0;

    const results = [];

    // 2. Procesar cada producto
    for (const product of products) {
        processed++;

        // Procesar imagen principal
        if (product.image_url) {
            const result = await processImage(product.id, product.image_url, false);

            if (result.success && !result.skipped) {
                // Actualizar la URL en la base de datos
                if (DRY_RUN) {
                    console.log(`   🔍 [SIMULACIÓN] Se actualizaria DB con nueva URL`);
                    success++;
                    results.push({
                        productId: product.id,
                        type: 'main',
                        ...result
                    });
                } else {
                    const { error: updateError } = await supabase
                        .from('products')
                        .update({ image_url: result.newUrl })
                        .eq('id', product.id);

                    if (updateError) {
                        console.error(`   ❌ Error actualizando DB:`, updateError.message);
                        failed++;
                    } else {
                        console.log(`   💾 Actualizada en DB`);
                        success++;
                        results.push({
                            productId: product.id,
                            type: 'main',
                            ...result
                        });
                    }
                }
            } else if (result.skipped) {
                skipped++;
            } else {
                failed++;
            }
        }

        // Procesar imágenes de galería
        if (product.gallery_images && Array.isArray(product.gallery_images)) {
            for (const galleryUrl of product.gallery_images) {
                const result = await processImage(product.id, galleryUrl, true);

                if (result.success && !result.skipped) {
                    // Actualizar la galería (reemplazar URL específica)
                    const updatedGallery = product.gallery_images.map(url =>
                        url === galleryUrl ? result.newUrl : url
                    );

                    if (DRY_RUN) {
                        console.log(`   🔍 [SIMULACIÓN] Se actualizaria galería en DB`);
                        success++;
                        results.push({
                            productId: product.id,
                            type: 'gallery',
                            ...result
                        });
                    } else {
                        const { error: updateError } = await supabase
                            .from('products')
                            .update({ gallery_images: updatedGallery })
                            .eq('id', product.id);

                        if (!updateError) {
                            console.log(`   💾 Galería actualizada en DB`);
                            success++;
                            results.push({
                                productId: product.id,
                                type: 'gallery',
                                ...result
                            });
                        }
                    }
                } else if (result.skipped) {
                    skipped++;
                }
            }
        }

        // Mostrar progreso cada 10 productos
        if (processed % 10 === 0) {
            console.log(`\n   --- Progreso: ${processed}/${products.length} ---\n`);
        }

        // Pequeña pausa para no saturar la API (solo en modo real)
        if (!DRY_RUN) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    // 3. Resumen
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN');
    console.log('='.repeat(50));
    console.log(`   Productos procesados: ${processed}`);
    console.log(`   ✅ Comprimidas y actualizadas: ${success}`);
    console.log(`   ⏭️  Omitidas (ya dentro del límite): ${skipped}`);
    console.log(`   ❌ Fallidas: ${failed}`);
    console.log('='.repeat(50));

    if (results.length > 0) {
        console.log('\n📝 Imágenes procesadas:');
        results.forEach(r => {
            console.log(`   - ${r.type}: ${r.originalSize}KB → ${r.newSize}KB (${r.savings}% ahorro)`);
        });
    }

    console.log('\n✨ Completado!');
}

// Ejecutar
main().catch(console.error);
