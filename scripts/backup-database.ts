/**
 * 🗄️ Script de Backup de Base de Datos Supabase (TypeScript)
 * =========================================================
 * 
 * Este script permite realizar backups manuales de la base de datos
 * de Supabase, útil para el plan free que no incluye backups automáticos.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const BACKUP_DIR = path.join(__dirname, '..', 'backups', 'db');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureBackupDir(): void {
    const dirs = [
        BACKUP_DIR,
        path.join(BACKUP_DIR, 'full'),
        path.join(BACKUP_DIR, 'data'),
        path.join(BACKUP_DIR, 'schema'),
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

function getSupabaseClient(): SupabaseClient {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        log('❌ Error: Variables de entorno no configuradas', 'red');
        process.exit(1);
    }

    return createClient(supabaseUrl, supabaseKey);
}

async function exportTableData(supabase: SupabaseClient, tableName: string) {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
        log(`⚠️  Error exportando ${tableName}: ${error.message}`, 'yellow');
        return null;
    }
    return data;
}

async function backupData(supabase: SupabaseClient) {
    log('\n📊 Iniciando backup de datos...', 'cyan');

    const tables = [
        'stores', 'products', 'categories', 'leads',
        'clients', 'payments', 'whatsapp_messages', 'product_images',
    ];

    const backupData: Record<string, any[]> = {};
    let successCount = 0;

    for (const table of tables) {
        const data = await exportTableData(supabase, table);
        if (data !== null) {
            backupData[table] = data;
            successCount++;
            log(`  ✅ ${table}: ${data.length} registros`, 'green');
        }
    }

    const filename = `data_${TIMESTAMP}.json`;
    const filepath = path.join(BACKUP_DIR, 'data', filename);

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    log(`\n💾 Backup de datos guardado: ${filepath}`, 'green');

    return { successCount, totalTables: tables.length, filepath };
}

async function main() {
    log('\n🛡️  BACKUP DE BASE DE DATOS (TS)', 'cyan');
    ensureBackupDir();

    const supabase = getSupabaseClient();
    const results = await backupData(supabase);

    const manifestPath = path.join(BACKUP_DIR, `manifest_${TIMESTAMP}.json`);
    fs.writeFileSync(manifestPath, JSON.stringify({ timestamp: TIMESTAMP, results }, null, 2));

    log('\n✅ BACKUP COMPLETADO', 'green');
}

main().catch(error => {
    console.error(`\n❌ Error fatal: ${error.message}`);
    process.exit(1);
});