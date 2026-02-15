/**
 * 🕵️ Migration Linter - Clicando
 * Valida que el historial de base de datos sea coherente y seguro.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

function lintMigrations() {
    console.log('🧐 Auditando integridad del historial de base de datos...');

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
        const content = fs.readFileSync(filePath, 'utf8');

        // Regla 1: Nomenclatura
        if (!/^\d{14}_.+\.sql$/.test(file)) {
            console.warn(`⚠️ Archivo con nombre no estándar: ${file}. Se recomienda YYYYMMDDHHMMSS_name.sql`);
        }

        // Regla 2: Seguridad Destructiva
        if (content.toLowerCase().includes('drop table') && !content.toLowerCase().includes('drop table if exists')) {
            console.warn(`🚨 PRECAUCIÓN: El archivo ${file} contiene "DROP TABLE". Asegúrate de que sea intencional.`);
        }

        // Regla 3: RLS Check sugerido
        if (content.toLowerCase().includes('create table') && !content.toLowerCase().includes('enable row level security')) {
            console.warn(`💡 TIP: El archivo ${file} crea una tabla pero no parece habilitar RLS en el mismo script.`);
        }
    });

    console.log('\n✨ Auditoría de migraciones completada.');
}

lintMigrations();
