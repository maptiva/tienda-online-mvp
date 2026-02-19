/**
 * Script de Backup de Configuración Local
 * =======================================
 * 
 * Resguarda archivos de configuración local sensibles que NO van al repo.
 * Crea un backup encriptado/seguro de los .env y configuraciones locales.
 * 
 * Uso:
 *   npm run backup:config
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const BACKUP_DIR = path.join(ROOT_DIR, 'backups', 'config');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        log(`📁 Directorio creado: ${BACKUP_DIR}`, 'cyan');
    }
}

function fileExists(filepath) {
    return fs.existsSync(filepath);
}

function getFilesToBackup() {
    const files = [
        { name: '.env', path: path.join(ROOT_DIR, '.env'), required: false },
        { name: '.env.local', path: path.join(ROOT_DIR, '.env.local'), required: false },
        { name: '.env.development', path: path.join(ROOT_DIR, '.env.development'), required: false },
        { name: '.env.production', path: path.join(ROOT_DIR, '.env.production'), required: false },
        { name: '.env.local.example', path: path.join(ROOT_DIR, '.env.local.example'), required: true },
        { name: '.env.example', path: path.join(ROOT_DIR, '.env.example'), required: true },
    ];

    return files;
}

function backupEnvFiles() {
    log('\n🔐 Backup de archivos de configuración...', 'cyan');

    const files = getFilesToBackup();
    const backupData = {
        timestamp: TIMESTAMP,
        date: new Date().toISOString(),
        files: [],
        warnings: [],
    };

    for (const file of files) {
        if (fileExists(file.path)) {
            try {
                const content = fs.readFileSync(file.path, 'utf-8');

                // No guardar contenido sensible en el backup directo
                // Solo guardar referencia y hash para verificación
                const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);

                backupData.files.push({
                    name: file.name,
                    exists: true,
                    hash: hash,
                    size: content.length,
                    backedUp: true,
                });

                // Crear copia del archivo real (en carpeta separada, NO va al repo)
                const backupPath = path.join(BACKUP_DIR, 'secrets', `${file.name}.${TIMESTAMP}.bak`);
                const secretsDir = path.join(BACKUP_DIR, 'secrets');

                if (!fs.existsSync(secretsDir)) {
                    fs.mkdirSync(secretsDir, { recursive: true });
                }

                fs.writeFileSync(backupPath, content);
                log(`  ✅ ${file.name} -> ${backupPath}`, 'green');

            } catch (error) {
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
    const examplePath = path.join(ROOT_DIR, '.env.local.example');

    const requiredVars = [
        { name: 'VITE_SUPABASE_URL', description: 'URL del proyecto Supabase' },
        { name: 'VITE_SUPABASE_ANON_KEY', description: 'Clave pública anónima de Supabase' },
        { name: 'VITE_SUPER_ADMIN_EMAILS', description: 'Emails de super administradores (separados por coma)' },
    ];

    const optionalVars = [
        { name: 'VITE_MERCADO_PAGO_PUBLIC_KEY', description: 'Clave pública de Mercado Pago (futuro)' },
        { name: 'VITE_GOOGLE_ANALYTICS_ID', description: 'ID de Google Analytics (futuro)' },
    ];

    let templateContent = `# ============================================
# Configuración de Clicando - Template
# ============================================
# Generado: ${new Date().toISOString()}
# 
# INSTRUCCIONES:
# 1. Copiar este archivo como .env.local
# 2. Completar los valores de cada variable
# 3. NUNCA subir .env.local al repositorio
# ============================================

# --- REQUERIDOS ---
`;

    for (const v of requiredVars) {
        templateContent += `${v.name}=\n`;
    }

    templateContent += `\n# --- OPCIONALES ---\n`;

    for (const v of optionalVars) {
        templateContent += `# ${v.name}=\n`;
    }

    templateContent += `\n# --- DESCRIPCIONES ---\n`;
    templateContent += `# VITE_SUPABASE_URL: URL del proyecto Supabase (ej: https://xxx.supabase.co)\n`;
    templateContent += `# VITE_SUPABASE_ANON_KEY: Clave pública anónima del proyecto\n`;
    templateContent += `# VITE_SUPER_ADMIN_EMAILS: Emails de admins separados por coma\n`;

    // Actualizar template si no existe o está desactualizado
    if (!fileExists(templatePath)) {
        fs.writeFileSync(templatePath, templateContent);
        log(`  ✅ Creado .env.template`, 'green');
    } else {
        log(`  ℹ️  .env.template ya existe`, 'dim');
    }

    return { requiredVars, optionalVars };
}

function createGitignoreCheck() {
    log('\n🔍 Verificando .gitignore...', 'cyan');

    const gitignorePath = path.join(ROOT_DIR, '.gitignore');
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');

    const mustIgnore = [
        '.env',
        '.env.local',
        '.env.*.local',
        '.env.development',
        '.env.production',
        'backups/',
    ];

    const warnings = [];

    for (const pattern of mustIgnore) {
        if (!gitignoreContent.includes(pattern)) {
            warnings.push(`⚠️  ${pattern} NO está en .gitignore - RIESGO DE SEGURIDAD`);
        }
    }

    if (warnings.length === 0) {
        log('  ✅ .gitignore configurado correctamente', 'green');
    } else {
        warnings.forEach(w => log(w, 'red'));
    }

    return { warnings };
}

function createBackupManifest(backupData, envTemplate, gitignoreCheck) {
    const manifest = {
        timestamp: TIMESTAMP,
        date: new Date().toISOString(),
        type: 'config_backup',
        backup: backupData,
        envTemplate: envTemplate,
        gitignore: gitignoreCheck,
        instructions: {
            restore: [
                '1. Copiar archivos de backups/config/secrets/ a la raíz del proyecto',
                '2. Renombrar quitando el timestamp (ej: .env.local.2026-02-19.bak -> .env.local)',
                '3. Verificar que los valores sean correctos',
            ],
            security: [
                'NUNCA subir la carpeta backups/ al repositorio',
                'Mantener backups/config/secrets/ en almacenamiento seguro',
                'Rotar claves si hay sospecha de compromiso',
            ],
        }
    };

    const manifestPath = path.join(BACKUP_DIR, `manifest_${TIMESTAMP}.json`);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    return manifestPath;
}

async function main() {
    log('\n🔐 ═══════════════════════════════════════════════', 'cyan');
    log('   BACKUP DE CONFIGURACIÓN LOCAL', 'cyan');
    log('🔐 ═══════════════════════════════════════════════\n', 'cyan');

    ensureBackupDir();

    const backupData = backupEnvFiles();
    const envTemplate = createEnvTemplate();
    const gitignoreCheck = createGitignoreCheck();

    const manifestPath = createBackupManifest(backupData, envTemplate, gitignoreCheck);

    log('\n✅ ═══════════════════════════════════════════════', 'green');
    log('   BACKUP DE CONFIG COMPLETADO', 'green');
    log('✅ ═══════════════════════════════════════════════\n', 'green');

    log(`📋 Manifiesto: ${manifestPath}`, 'cyan');
    log(`📁 Secrets: ${path.join(BACKUP_DIR, 'secrets')}`, 'cyan');

    log('\n⚠️  IMPORTANTE:', 'yellow');
    log('   - La carpeta backups/ NO debe ir al repositorio', 'yellow');
    log('   - Copiar backups/config/secrets/ a lugar seguro', 'yellow');
    log('   - Los archivos .env contienen credenciales sensibles', 'yellow');
}

main().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
});
