/**
 * Script de Backup de Base de Datos Supabase
 * ===========================================
 * 
 * Este script permite realizar backups manuales de la base de datos
 * de Supabase, útil para el plan free que no incluye backups automáticos.
 * 
 * Uso:
 *   npm run backup:db              - Backup completo
 *   npm run backup:db -- --data    - Solo datos
 *   npm run backup:db -- --schema  - Solo estructura
 *   npm run backup:db -- --help    - Ver ayuda
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const BACKUP_DIR = path.join(__dirname, '..', 'backups', 'db');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureBackupDir() {
    const dirs = [
        BACKUP_DIR,
        path.join(BACKUP_DIR, 'full'),
        path.join(BACKUP_DIR, 'data'),
        path.join(BACKUP_DIR, 'schema'),
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            log(`📁 Directorio creado: ${dir}`, 'cyan');
        }
    });
}

function getSupabaseClient() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        log('❌ Error: Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY no configuradas', 'red');
        log('💡 Asegúrate de tener un archivo .env.local con estas variables', 'yellow');
        process.exit(1);
    }

    return createClient(supabaseUrl, supabaseKey);
}

async function exportTableData(supabase, tableName) {
    const { data, error } = await supabase
        .from(tableName)
        .select('*');

    if (error) {
        log(`⚠️  Error exportando ${tableName}: ${error.message}`, 'yellow');
        return null;
    }

    return data;
}

async function backupData(supabase) {
    log('\n📊 Iniciando backup de datos...', 'cyan');

    // Tablas principales del sistema
    const tables = [
        'stores',
        'products',
        'categories',
        'leads',
        'clients',
        'payments',
        'whatsapp_messages',
        'product_images',
    ];

    const backupData = {};
    let successCount = 0;

    for (const table of tables) {
        const data = await exportTableData(supabase, table);
        if (data !== null) {
            backupData[table] = data;
            successCount++;
            log(`  ✅ ${table}: ${data.length} registros`, 'green');
        } else {
            backupData[table] = [];
        }
    }

    // Guardar backup
    const filename = `data_${TIMESTAMP}.json`;
    const filepath = path.join(BACKUP_DIR, 'data', filename);

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    log(`\n💾 Backup de datos guardado: ${filepath}`, 'green');

    return { successCount, totalTables: tables.length, filepath };
}

async function backupSchema() {
    log('\n📐 Backup de schema...', 'cyan');

    // El schema se obtiene mejor con Supabase CLI
    // Este es un placeholder que indica cómo hacerlo manualmente

    const schemaInfo = {
        timestamp: TIMESTAMP,
        note: 'Para backup completo del schema, usar Supabase CLI:',
        commands: [
            'supabase db dump -f backups/db/schema/schema_TIMESTAMP.sql --schema-only',
            'supabase db dump -f backups/db/full/backup_TIMESTAMP.sql',
        ],
        tables: [
            'stores', 'products', 'categories', 'leads',
            'clients', 'payments', 'whatsapp_messages', 'product_images'
        ],
        migrations: 'Ver carpeta sql/ para migraciones versionadas'
    };

    const filename = `schema_info_${TIMESTAMP}.json`;
    const filepath = path.join(BACKUP_DIR, 'schema', filename);

    fs.writeFileSync(filepath, JSON.stringify(schemaInfo, null, 2));
    log(`📄 Info de schema guardada: ${filepath}`, 'green');

    log('\n⚠️  Para backup completo del schema, ejecutar:', 'yellow');
    log('   supabase db dump -f backups/db/schema/schema_TIMESTAMP.sql --schema-only', 'cyan');

    return { filepath };
}

async function createBackupManifest(results) {
    const manifest = {
        timestamp: TIMESTAMP,
        date: new Date().toISOString(),
        type: 'manual',
        backups: results,
        environment: {
            node: process.version,
            platform: process.platform,
        },
        nextSteps: [
            '1. Verificar que los archivos se generaron correctamente',
            '2. Copiar backups a almacenamiento seguro (Google Drive, etc.)',
            '3. Eliminar backups antiguos si es necesario',
        ]
    };

    const manifestPath = path.join(BACKUP_DIR, `manifest_${TIMESTAMP}.json`);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    return manifestPath;
}

function printHelp() {
    console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════╗
║         Script de Backup - Clicando Database                ║
╚════════════════════════════════════════════════════════════╝${colors.reset}

${colors.yellow}Uso:${colors.reset}
  npm run backup:db              Backup completo (datos + info schema)
  npm run backup:db -- --data    Solo backup de datos
  npm run backup:db -- --schema  Solo info de schema
  npm run backup:db -- --help    Mostrar esta ayuda

${colors.yellow}Opciones:${colors.reset}
  --data     Exporta datos de todas las tablas a JSON
  --schema   Genera info del schema (requiere CLI para dump completo)
  --full     Backup completo (por defecto)

${colors.yellow}Requisitos:${colors.reset}
  - Archivo .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
  - Supabase CLI instalado para dumps SQL completos

${colors.yellow}Ejemplos:${colors.reset}
  # Backup rápido de datos
  npm run backup:db -- --data

  # Backup completo con CLI
  npm run backup:db && supabase db dump -f backups/db/full/backup.sql

${colors.yellow}Almacenamiento:${colors.reset}
  Los backups se guardan en: backups/db/
  ├── full/     - Backups SQL completos (via CLI)
  ├── data/     - Datos exportados en JSON
  └── schema/   - Info del schema
`);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        printHelp();
        process.exit(0);
    }

    log('\n🛡️  ═══════════════════════════════════════════════', 'cyan');
    log('   BACKUP DE BASE DE DATOS - CLICANDO', 'cyan');
    log('🛡️  ═══════════════════════════════════════════════\n', 'cyan');

    ensureBackupDir();

    const supabase = getSupabaseClient();
    const results = {};

    const doData = args.includes('--data') || args.length === 0 || args.includes('--full');
    const doSchema = args.includes('--schema') || args.length === 0 || args.includes('--full');

    if (doData) {
        results.data = await backupData(supabase);
    }

    if (doSchema) {
        results.schema = await backupSchema();
    }

    const manifestPath = await createBackupManifest(results);

    log('\n✅ ═══════════════════════════════════════════════', 'green');
    log('   BACKUP COMPLETADO', 'green');
    log('✅ ═══════════════════════════════════════════════\n', 'green');

    log(`📋 Manifiesto: ${manifestPath}`, 'cyan');
    log('\n📌 Próximos pasos:', 'yellow');
    log('   1. Verificar archivos generados en backups/db/', 'reset');
    log('   2. Para SQL completo: supabase db dump -f backups/db/full/backup.sql', 'reset');
    log('   3. Copiar a almacenamiento seguro (Google Drive, etc.)', 'reset');
}

main().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
});
