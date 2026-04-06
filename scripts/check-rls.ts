/**
 * 🛡️ RLS Health Check - Clicando Multi-tenant Guard (TypeScript)
 * Este script audita la base de datos para asegurar que TODAS las tablas 
 * del schema público tengan habilitado Row Level Security.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Definición de interfaz para el resultado del RPC
interface TableRLSStatus {
  table_name: string;
  rls_enabled: boolean;
  policy_count: number;
}

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.development');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkRLS(): Promise<void> {
  console.log('🔍 Iniciando auditoría de seguridad RLS...');

  // Consulta para obtener el estado de RLS de todas las tablas en el schema 'public'
  // El RPC debe devolver el tipo TableRLSStatus[]
  const { data, error } = await supabase.rpc('get_rls_status');

  if (error) {
    console.error('❌ Error al ejecutar el Monitor de Seguridad (RPC).');
    console.error('Asegúrate de haber ejecutado el SQL de sql/report-rls.sql en el dashboard.');
    console.error(error.message);
    process.exit(1);
  }

  const tables = data as TableRLSStatus[];

  console.log('\n--- 📊 Reporte de Seguridad RLS ---');
  let hasInsecure = false;

  console.table(tables.map(t => ({
    'Tabla': t.table_name,
    'Estado': t.rls_enabled ? '✅ SECURE' : '❌ INSECURE',
    'Políticas': t.policy_count
  })));

  tables.forEach(t => {
    if (!t.rls_enabled) {
      console.error(`🚨 PELIGRO: La tabla "${t.table_name}" NO tiene RLS activo.`);
      hasInsecure = true;
    }
  });

  if (hasInsecure) {
    console.log('\n❌ Auditoría fallida. Se encontraron tablas inseguras.');
    process.exit(1);
  } else {
    console.log('\n✅ Auditoría exitosa. Todas las tablas tienen RLS habilitado.');
    process.exit(0);
  }
}

checkRLS();