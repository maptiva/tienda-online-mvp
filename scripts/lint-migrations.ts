/**
 * 🕵️ Migration Linter (TypeScript)
 * Valida que el historial de base de datos sea coherente y seguro.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

function lintMigrations(): void {
    console.log('🧐 Auditando integridad del historial de base de datos (TS)...');

    if (!fs.existsSync(migrationsDir)) {
        console.error('❌ Error: El directorio de migraciones no existe.');
        process.exit(1);
    }

    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    if (files.length === 0) {
        console.warn('⚠️ No se encontraron archivos de migración.');
        return;
    }

    console.log(`✅ Se encontraron ${files.length} migraciones.`);

    files.forEach(file => {
        const filePath = path.join(migrationsDir, file);
        const content = fs.readFileSync(filePath, 'utf8').toLowerCase();

        if (!/^\d{14}_.+\.sql$/.test(file)) {
            console.warn(`⚠️ Nombre no estándar: ${file}`);
        }

        if (content.includes('drop table') && !content.includes('drop table if exists')) {
            console.warn(`🚨 PRECAUCIÓN: ${file} contiene "DROP TABLE".`);
        }

        if (content.includes('create table') && !content.includes('enable row level security')) {
            console.warn(`💡 TIP: ${file} crea tabla sin habilitar RLS.`);
        }
    });

    console.log('\n✨ Auditoría de migraciones completada.');
}

lintMigrations();