import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStatsInsert() {
  console.log('--- TEST: Inserción de Estadísticas (Anónimo) ---');

  // Intentar insertar un evento de visita para una tienda cualquiera
  // (Asumimos que el store_id 1 existe para esta prueba)
  const { data, error } = await supabase
    .from('shop_stats')
    .insert([{
      store_id: 1,
      event_type: 'visit',
      metadata: { test: true }
    }]);

  if (error) {
    console.error('❌ ERROR AL INSERTAR:', error.message);
    console.error('Detalle:', error.details);
    console.error('Pista:', error.hint);
  } else {
    console.log('✅ INSERCIÓN EXITOSA');
  }
}

testStatsInsert();
