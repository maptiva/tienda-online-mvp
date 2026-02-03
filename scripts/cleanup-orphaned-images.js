/**
 * Script de Limpieza Segura de Imágenes Huérfanas
 * 
 * Este script identifica y elimina imágenes en Supabase Storage que NO están
 * siendo usadas por ningún producto en la base de datos.
 * 
/**
 * Extrae el nombre del archivo desde una URL de Supabase
 */
function extractFileName(url) {
    if (!url) return null;
    const parts = url.split('/product-images/');
    return parts.length > 1 ? parts[1] : null;
}

/**
 * Obtiene todas las URLs de imágenes usadas en productos
 */
async function getUsedImageUrls() {
    console.log('📋 Obteniendo lista de imágenes en uso...');

    const { data: products, error } = await supabase
        .from('products')
        .select('image_url');

    if (error) {
        throw new Error(`Error al obtener productos: ${error.message}`);
    }

    const usedUrls = new Set();
    products.forEach(product => {
        if (product.image_url) {
            const fileName = extractFileName(product.image_url);
            if (fileName) {
                usedUrls.add(fileName);
            }
        }
    });

    console.log(`✅ Encontradas ${usedUrls.size} imágenes en uso`);
    return usedUrls;
}

/**
 * Obtiene todas las URLs de logos usados en tiendas
 */
async function getUsedLogoUrls() {
    console.log('📋 Obteniendo lista de logos en uso...');

    const { data: stores, error } = await supabase
        .from('stores')
        .select('logo_url');

    if (error) {
        throw new Error(`Error al obtener tiendas: ${error.message}`);
    }

    const usedUrls = new Set();
    stores.forEach(store => {
        if (store.logo_url) {
            const fileName = extractFileName(store.logo_url);
            if (fileName) {
                usedUrls.add(fileName);
            }
        }
    });

    console.log(`✅ Encontrados ${usedUrls.size} logos en uso`);
    return usedUrls;
}

/**
 * Obtiene todos los archivos en Storage
 */
async function getAllStorageFiles() {
    console.log('📁 Obteniendo lista de archivos en Storage...');

    const { data: files, error } = await supabase.storage
        .from('product-images')
        .list();

    if (error) {
        throw new Error(`Error al listar archivos: ${error.message}`);
    }

    console.log(`✅ Encontrados ${files.length} archivos en Storage`);
    return files;
}

/**
 * Identifica archivos huérfanos (no usados)
 */
function findOrphanedFiles(allFiles, usedImageUrls, usedLogoUrls) {
    const orphaned = [];
    const usedUrls = new Set([...usedImageUrls, ...usedLogoUrls]);

    allFiles.forEach(file => {
        if (!usedUrls.has(file.name)) {
            orphaned.push(file);
        }
    });

    return orphaned;
}

/**
 * Solicita confirmación del usuario
 */
function askConfirmation(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'y');
        });
    });
}

/**
 * Elimina archivos huérfanos
 */
async function deleteOrphanedFiles(orphanedFiles, dryRun = true) {
    if (orphanedFiles.length === 0) {
        console.log('✅ No hay archivos huérfanos para eliminar');
        return;
    }

    console.log(`\n🗑️  Archivos huérfanos encontrados (${orphanedFiles.length}):`);
    console.log('─'.repeat(60));

    orphanedFiles.forEach((file, index) => {
        const sizeKB = (file.metadata?.size / 1024).toFixed(2);
        console.log(`${index + 1}. ${file.name} (${sizeKB} KB)`);
    });

    console.log('─'.repeat(60));

    const totalSizeKB = orphanedFiles.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) / 1024;
    console.log(`📊 Espacio total a liberar: ${totalSizeKB.toFixed(2)} KB`);

    if (dryRun) {
        console.log('\n⚠️  MODO DRY-RUN: No se eliminará nada');
        console.log('Para eliminar realmente, ejecuta: node cleanup-orphaned-images.js --delete');
        return;
    }

    console.log('\n⚠️  ADVERTENCIA: Esta acción NO se puede deshacer');
    const confirmed = await askConfirmation('¿Estás seguro de eliminar estos archivos? (s/n): ');

    if (!confirmed) {
        console.log('❌ Operación cancelada');
        return;
    }

    console.log('\n🗑️  Eliminando archivos...');

    const fileNames = orphanedFiles.map(f => f.name);
    const { data, error } = await supabase.storage
        .from('product-images')
        .remove(fileNames);

    if (error) {
        console.error('❌ Error al eliminar archivos:', error.message);
        return;
    }

    console.log(`✅ ${fileNames.length} archivos eliminados exitosamente`);
    console.log(`💾 Espacio liberado: ${totalSizeKB.toFixed(2)} KB`);
}

/**
 * Función principal
 */
async function main() {
    console.log('🧹 Script de Limpieza de Imágenes Huérfanas\n');

    const isDryRun = !process.argv.includes('--delete');

    if (isDryRun) {
        console.log('ℹ️  Ejecutando en modo DRY-RUN (solo análisis, sin eliminar)\n');
    }

    try {
        // 1. Obtener imágenes en uso
        const usedImageUrls = await getUsedImageUrls();

        // 2. Obtener logos en uso
        const usedLogoUrls = await getUsedLogoUrls();

        // 3. Obtener todos los archivos en Storage
        const allFiles = await getAllStorageFiles();

        // 4. Identificar huérfanos
        const orphanedFiles = findOrphanedFiles(allFiles, usedImageUrls, usedLogoUrls);

        // 5. Eliminar (o mostrar) huérfanos
        await deleteOrphanedFiles(orphanedFiles, isDryRun);

        console.log('\n✅ Proceso completado');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar
main();
