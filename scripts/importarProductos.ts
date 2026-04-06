/**
 * 📦 Script de Importación de Productos desde CSV (TypeScript)
 * ========================================================
 * 
 * Este script lee un archivo CSV y crea productos en una tienda específica.
 * - Crea categorías automáticamente si no existen.
 * - Maneja descripciones vacías y multilínea.
 * - Inserta productos en lotes para mejor rendimiento.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
const envPath = path.join(__dirname, '..', '.env.development');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('📁 Cargando variables desde .env.development');
} else {
    const localEnvPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(localEnvPath)) {
        dotenv.config({ path: localEnvPath });
        console.log('📁 Cargando variables desde .env.local');
    } else {
        console.log('⚠️  No se encontró archivo .env.development ni .env.local');
    }
}

// Interfaces de datos
interface CSVRecord {
  nombre?: string;
  name?: string;
  Nombre?: string;
  categoria?: string;
  category?: string;
  Categoria?: string;
  precio?: string | number;
  price?: string | number;
  Precio?: string | number;
  descripcion?: string;
  description?: string;
  Descripcion?: string;
}

interface ProductToInsert {
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  user_id: string;
  stock: number;
  image_url: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface ImportStats {
  total: number;
  skipped: number;
  success: number;
  errors: { name: string; error: string }[];
}

// CONFIGURACIÓN
const USER_ID = 'a910ac25-cc6f-485d-adc9-afba20f9966b';
const CSV_PATH = path.join(__dirname, '..', 'prod_ruwaq_edit.csv');
const BATCH_SIZE = 50;

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function getSupabaseClient(): SupabaseClient {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        log('❌ Error: Variables de entorno no configuradas', 'red');
        process.exit(1);
    }

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        log('⚠️  Usando SERVICE_ROLE_KEY - Modo administrador', 'yellow');
    }

    return createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

async function getExistingCategories(supabase: SupabaseClient, userId: string): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', userId);

    if (error) {
        log(`⚠️  Error obteniendo categorías: ${error.message}`, 'yellow');
        return [];
    }

    return (data as Category[]) || [];
}

async function createCategory(supabase: SupabaseClient, userId: string, categoryName: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from('categories')
        .insert({ name: categoryName, user_id: userId })
        .select('id, name')
        .single();

    if (error) {
        log(`❌ Error creando categoría "${categoryName}": ${error.message}`, 'red');
        return null;
    }

    return data as Category;
}

async function main() {
    log('\n🚀 INICIANDO IMPORTACIÓN DE PRODUCTOS (TS)', 'magenta');
    
    if (!fs.existsSync(CSV_PATH)) {
        log(`❌ Error: No se encuentra el archivo CSV en: ${CSV_PATH}`, 'red');
        process.exit(1);
    }

    const supabase = getSupabaseClient();
    
    log('\n📄 Leyendo archivo CSV...', 'cyan');
    const fileContent = fs.readFileSync(CSV_PATH, 'latin1');
    const records: CSVRecord[] = parse(fileContent, {
        delimiter: ';',
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        relax_quotes: true,
        trim: true,
    });

    log(`✅ ${records.length} registros leídos`, 'green');

    const existingCategories = await getExistingCategories(supabase, USER_ID);
    const categoryMap = new Map<string, string>();
    existingCategories.forEach(cat => categoryMap.set(cat.name, cat.id));

    // Crear categorías faltantes
    const csvCategoryNames = new Set<string>();
    records.forEach(r => {
        const cat = r.categoria || r.category || r.Categoria;
        if (cat?.trim()) csvCategoryNames.add(cat.trim());
    });

    for (const name of csvCategoryNames) {
        if (!categoryMap.has(name)) {
            const newCat = await createCategory(supabase, USER_ID, name);
            if (newCat) {
                categoryMap.set(name, newCat.id);
                log(`   ✨ Categoría creada: "${name}"`, 'green');
            }
        }
    }

    // Procesar productos
    const products: ProductToInsert[] = [];
    let skipped = 0;

    for (const record of records) {
        const name = record.nombre || record.name || record.Nombre;
        if (!name?.trim()) {
            skipped++;
            continue;
        }

        const categoryName = record.categoria || record.category || record.Categoria || '';
        const priceStr = record.precio || record.price || record.Precio || '0';
        const price = parseFloat(priceStr.toString().replace(/[^\d.-]/g, '')) || 0;
        const description = record.descripcion || record.description || record.Descripcion || '';
        const cleanDescription = description.replace(/\s+/g, ' ').trim();

        products.push({
            name: name.trim(),
            description: cleanDescription || null,
            price,
            category_id: categoryName ? categoryMap.get(categoryName.trim()) || null : null,
            user_id: USER_ID,
            stock: 0,
            image_url: null,
        });
    }

    // Insertar por lotes
    let successCount = 0;
    const errors: { name: string; error: string }[] = [];

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('products').insert(batch);

        if (error) {
            log(`⚠️  Fallo en lote, reintentando uno a uno...`, 'yellow');
            for (const p of batch) {
                const { error: singleError } = await supabase.from('products').insert(p);
                if (singleError) errors.push({ name: p.name, error: singleError.message });
                else successCount++;
            }
        } else {
            successCount += batch.length;
        }
        log(`   📦 Proceso: ${Math.min(i + BATCH_SIZE, products.length)}/${products.length}`, 'cyan');
    }

    log('\n📊 REPORTE FINAL', 'magenta');
    log(`✅ Exitosos: ${successCount}`, 'green');
    log(`⚠️  Omitidos: ${skipped}`, 'yellow');
    if (errors.length > 0) log(`❌ Errores: ${errors.length}`, 'red');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});