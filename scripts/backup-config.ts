/**
 * 🔐 Script de Backup de Configuración Local (TypeScript)
 * ======================================================
 * 
 * Resguarda archivos de configuración local sensibles que NO van al repo.
 * Crea un backup seguro de los .env y configuraciones locales.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const BACKUP_DIR = path.join(ROOT_DIR, 'backups', 'config');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// Estructuras de datos
interface FileBackupInfo {
    name: string;
    path: string;
    required: boolean;
}

interface BackupResult {
    name: string;
    exists: boolean;
    hash?: string;
    size?: number;
    backedUp?: boolean;
    required?: boolean;
}

interface Manifest {
    timestamp: string;
    date: string;
    type: string;
    backup: {
        timestamp: string;
        date: string;
        files: BackupResult[];
        warnings: string[];
    };
    envTemplate: any;
    gitignore: any;
    instructions: {
        restore: string[];
        security: string[];
    };
}

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureBackupDir(): void {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        log(`📁 Directorio creado: ${BACKUP_DIR}`, 'cyan');
    }
}

function getFilesToBackup(): FileBackupInfo[] {
    return [
        { name: '.env', path: path.join(ROOT_DIR, '.env'), required: false },
        { name: '.env.local', path: path.join(ROOT_DIR, '.env.local'), required: false },
        { name: '.env.development', path: path.join(ROOT_DIR, '.env.development'), required: false },
        { name: '.env.production', path: path.join(ROOT_DIR, '.env.production'), required: false },
        { name: '.env.local.example', path: path.join(ROOT_DIR, '.env.local.example'), required: true },
        { name: '.env.example', path: path.join(ROOT_DIR, '.env.example'), required: true },
    ];
}

function backupEnvFiles() {
    log('\n🔐 Backup de archivos de configuración...', 'cyan');

    const files = getFilesToBackup();
    const backupData = {
        timestamp: TIMESTAMP,
        date: new Date().toISOString(),
        files: [] as BackupResult[],
        warnings: [] as string[],
    };

    for (const file of files) {
        if (fs.existsSync(file.path)) {
            try {
                const content = fs.readFileSync(file.path, 'utf-8');
                const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);

                backupData.files.push({
                    name: file.name,
                    exists: true,
                    hash: hash,
                    size: content.length,
                    backedUp: true,
                });

                const secretsDir = path.join(BACKUP_DIR, 'secrets');
                if (!fs.existsSync(secretsDir)) {
                    fs.mkdirSync(secretsDir, { recursive: true });
                }

                const backupPath = path.join(secretsDir, `${file.name}.${TIMESTAMP}.bak`);
                fs.writeFileSync(backupPath, content);
                log(`  ✅ ${file.name} -> ${backupPath}`, 'green');

            } catch (error: any) {
                backupData.warnings.push(`Error leyendo ${file.name}: ${error.message}`);
                log(`  ⚠️  Error con ${file.name}: ${error.message}`, 'yellow');
            }
        } else {
            backupData.files.push({
                name: file.name,
                exists: false,
                required: file.required,
            });

            if (file.required) {
                log(`  ⚠️  ${file.name} no existe (requerido)`, 'yellow');
            } else {
                log(`  ${colors.dim}ℹ️  ${file.name} no existe (opcional)${colors.reset}`, 'dim');
            }
        }
    }

    return backupData;
}

function createEnvTemplate() {
    log('\n📝 Verificando template de variables de entorno...', 'cyan');
    const templatePath = path.join(ROOT_DIR, '.env.template');

    const requiredVars = [
        { name: 'VITE_SUPABASE_URL', description: 'URL del proyecto Supabase' },
        { name: 'VITE_SUPABASE_ANON_KEY', description: 'Clave pública anónima de Oracle' },
        { name: 'VITE_SUPER_ADMIN_EMAILS', description: 'Emails de admins' },
    ];

    if (!fs.existsSync(templatePath)) {
        let content = `# Generado: ${new Date().toISOString()}\n\n# --- REQUERIDOS ---\n`;
        requiredVars.forEach(v => content += `${v.name}=\n`);
        fs.writeFileSync(templatePath, content);
        log(`  ✅ Creado .env.template`, 'green');
    }

    return { requiredVars };
}

async function main() {
    log('\n🔐 BACKUP DE CONFIGURACIÓN LOCAL (TS)', 'cyan');
    ensureBackupDir();

    const data = backupEnvFiles();
    const template = createEnvTemplate();

    const manifestPath = path.join(BACKUP_DIR, `manifest_${TIMESTAMP}.json`);
    fs.writeFileSync(manifestPath, JSON.stringify({ timestamp: TIMESTAMP, data, template }, null, 2));

    log('\n✅ BACKUP COMPLETADO', 'green');
}

main().catch(error => {
    console.error(`\n❌ Error fatal: ${error.message}`);
    process.exit(1);
});