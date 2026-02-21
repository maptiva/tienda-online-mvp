/**
 * Script de Importación de Productos desde CSV
 * ==============================================
 * 
 * Este script lee un archivo CSV y crea productos en una tienda específica.
 * - Crea categorías automáticamente si no existen
 * - Maneja descripciones vacías y multilínea
 * - Inserta productos en lotes para mejor rendimiento
 * 
 * Uso:
 *   node scripts/importarProductos.js
 * 
 * Requisitos:
 *   - Archivo .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
 *   - Archivo CSV en la raíz del proyecto
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env.development
const envPath = path.join(__dirname, '..', '.env.development');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('📁 Cargando variables desde .env.development');
} else {
    // Intentar con .env.local
    const localEnvPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(localEnvPath)) {
        dotenv.config({ path: localEnvPath });
        console.log('📁 Cargando variables desde .env.local');
    } else {
        console.log('⚠️  No se encontró archivo .env.development ni .env.local');
    }
}

// =====================================================
// CONFIGURACIÓN
// =====================================================
const USER_ID = 'a910ac25-cc6f-485d-adc9-afba20f9966b';
const CSV_PATH = path.join(__dirname, '..', 'prod_ruwaq_edit.csv');
const BATCH_SIZE = 50; // Productos a insertar por lote

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// =====================================================
// FUNCIONES DE BASE DE DATOS
// =====================================================

function getSupabaseClient() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    // Usar service_role_key para bypassear RLS durante la importación
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        log('❌ Error: Variables de entorno no configuradas', 'red');
        log('💡 Asegúrate de tener VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el archivo .env', 'yellow');
        process.exit(1);
    }

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        log('⚠️  Usando SERVICE_ROLE_KEY - Modo administrador (bypassea RLS)', 'yellow');
    } else {
        log('ℹ️  Usando ANON_KEY - Puede haber restricciones de RLS', 'cyan');
    }

    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

/**
 * Obtiene las categorías existentes de una tienda
 */
async function getExistingCategories(supabase, userId) {
    const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', userId);

    if (error) {
        log(`⚠️  Error obteniendo categorías: ${error.message}`, 'yellow');
        return [];
    }

    return data || [];
}

/**
 * Crea una nueva categoría para la tienda
 */
async function createCategory(supabase, userId, categoryName) {
    const { data, error } = await supabase
        .from('categories')
        .insert({
            name: categoryName,
            user_id: userId,
        })
        .select('id, name')
        .single();

    if (error) {
        log(`❌ Error creando categoría "${categoryName}": ${error.message}`, 'red');
        return null;
    }

    return data;
}

/**
 * Inserta productos en lotes
 */
async function insertProducts(supabase, products) {
    const results = {
        success: 0,
        errors: [],
    };

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);

        const { data, error } = await supabase
            .from('products')
            .insert(batch)
            .select('id, name');

        if (error) {
            // Si falla el lote completo, intentar uno por uno
            log(`⚠️  Error en lote, insertando uno por uno...`, 'yellow');
            for (const product of batch) {
                const { error: singleError } = await supabase
                    .from('products')
                    .insert(product);

                if (singleError) {
                    results.errors.push({
                        name: product.name,
                        error: singleError.message,
                    });
                } else {
                    results.success++;
                }
            }
        } else {
            results.success += batch.length;
        }

        // Mostrar progreso
        const progress = Math.min(i + BATCH_SIZE, products.length);
        log(`   📦 Progreso: ${progress}/${products.length} productos procesados`, 'cyan');
    }

    return results;
}

// =====================================================
// FUNCIONES DE PARSING CSV
// =====================================================

/**
 * Lee y parsea el archivo CSV
 */
function parseCSV(filePath) {
    // Intentar leer con diferentes encodings
    let fileContent;

    try {
        // Primero intentar con latin1 (para archivos de Excel en español)
        fileContent = fs.readFileSync(filePath, 'latin1');
    } catch (err) {
        log(`❌ Error leyendo archivo: ${err.message}`, 'red');
        process.exit(1);
    }

    const records = parse(fileContent, {
        delimiter: ';',
        columns: true, // Usar la primera fila como headers
        skip_empty_lines: true,
        relax_column_count: true, // Permitir filas con diferente número de columnas
        relax_quotes: true, // Ser flexible con las comillas
        trim: true, // Eliminar espacios en blanco
    });

    return records;
}

/**
 * Procesa los registros del CSV y los convierte a formato de producto
 */
function processRecords(records, categoryMap, userId) {
    const products = [];
    const stats = {
        total: records.length,
        skipped: 0,
        invalidPrice: 0,
    };

    for (const record of records) {
        // Validar que tenga nombre de producto
        const name = record.nombre || record.name || record.Nombre || '';
        if (!name || name.trim() === '') {
            stats.skipped++;
            continue;
        }

        // Obtener categoría
        const categoryName = record.categoria || record.category || record.Categoria || '';
        const categoryId = categoryName ? categoryMap.get(categoryName.trim()) : null;

        // Obtener precio
        const priceStr = record.precio || record.price || record.Precio || '0';
        const price = parseFloat(priceStr.toString().replace(/[^\d.-]/g, '')) || 0;

        // Obtener descripción
        const description = record.descripcion || record.description || record.Descripcion || '';

        // Limpiar descripción (remover saltos de línea excesivos)
        const cleanDescription = description
            .replace(/\r\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        products.push({
            name: name.trim(),
            description: cleanDescription || null,
            price: price,
            category_id: categoryId,
            user_id: userId,
            stock: 0,
            image_url: null,
        });
    }

    return { products, stats };
}

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

async function main() {
    log('\n🚀 INICIANDO IMPORTACIÓN DE PRODUCTOS', 'magenta');
    log('=========================================\n', 'magenta');

    // 1. Verificar que el archivo CSV existe
    if (!fs.existsSync(CSV_PATH)) {
        log(`❌ Error: No se encuentra el archivo CSV en: ${CSV_PATH}`, 'red');
        process.exit(1);
    }
    log(`✅ Archivo CSV encontrado: ${CSV_PATH}`, 'green');

    // 2. Conectar a Supabase
    log('\n📡 Conectando a Supabase...', 'cyan');
    const supabase = getSupabaseClient();
    log('✅ Conexión establecida', 'green');

    // 3. Leer y parsear CSV
    log('\n📄 Leyendo archivo CSV...', 'cyan');
    const records = parseCSV(CSV_PATH);
    log(`✅ ${records.length} registros leídos del CSV`, 'green');

    // 4. Obtener categorías existentes
    log('\n📁 Obteniendo categorías existentes...', 'cyan');
    const existingCategories = await getExistingCategories(supabase, USER_ID);
    log(`✅ ${existingCategories.length} categorías ya existen en la tienda`, 'green');

    // 5. Identificar categorías únicas del CSV
    const csvCategories = new Set();
    for (const record of records) {
        const cat = record.categoria || record.category || record.Categoria || '';
        if (cat && cat.trim() !== '') {
            csvCategories.add(cat.trim());
        }
    }
    log(`📋 ${csvCategories.size} categorías encontradas en el CSV`, 'cyan');

    // 6. Crear categorías que no existen
    log('\n🔨 Creando categorías faltantes...', 'cyan');
    const categoryMap = new Map();

    // Mapear categorías existentes
    for (const cat of existingCategories) {
        categoryMap.set(cat.name, cat.id);
    }

    let newCategoriesCount = 0;
    for (const categoryName of csvCategories) {
        if (!categoryMap.has(categoryName)) {
            const newCategory = await createCategory(supabase, USER_ID, categoryName);
            if (newCategory) {
                categoryMap.set(categoryName, newCategory.id);
                newCategoriesCount++;
                log(`   ✨ Categoría creada: "${categoryName}"`, 'green');
            }
        }
    }
    log(`✅ ${newCategoriesCount} categorías nuevas creadas`, 'green');

    // 7. Procesar productos
    log('\n⚙️  Procesando productos...', 'cyan');
    const { products, stats } = processRecords(records, categoryMap, USER_ID);
    log(`✅ ${products.length} productos listos para importar`, 'green');
    log(`   📊 Registros sin nombre (omitidos): ${stats.skipped}`, 'yellow');

    // 8. Insertar productos
    log('\n💾 Insertando productos en la base de datos...', 'cyan');
    const results = await insertProducts(supabase, products);

    // 9. Mostrar reporte final
    log('\n📊 REPORTE FINAL', 'magenta');
    log('=================', 'magenta');
    log(`✅ Productos insertados correctamente: ${results.success}`, 'green');

    if (results.errors.length > 0) {
        log(`❌ Errores encontrados: ${results.errors.length}`, 'red');
        results.errors.forEach((err, i) => {
            log(`   ${i + 1}. "${err.name}": ${err.error}`, 'red');
        });
    }

    log(`\n📁 Total categorías en la tienda: ${categoryMap.size}`, 'cyan');
    log(`📦 Total productos procesados: ${products.length}`, 'cyan');

    log('\n✨ Importación completada!\n', 'green');
}

// Ejecutar
main().catch(err => {
    log(`\n❌ Error fatal: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
});
