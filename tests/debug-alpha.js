import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const STORE = 'alpha-athletics';
const PRODUCTO = 7; // Short Deportivo de Alpha

async function debugAlpha() {
  console.log(`🚀 Probando pedido en ${STORE}...`);
  
  const { data, error } = await supabase.rpc('create_public_order', {
    p_store_slug: STORE,
    p_customer_info: { name: 'Debugger', phone: '123' },
    p_items: [{ product_id: PRODUCTO, quantity: 1 }],
    p_client_total: 0,
    p_payment_method: 'cash',
    p_discount_applied: 0
  });

  if (error) {
    console.error('❌ Error de RPC:', error.message);
  } else if (data.success) {
    console.log('✅ ÉXITO:', data);
  } else {
    console.log('🛡️ BLOQUEADO POR REGLA:', data.error);
  }
}

debugAlpha();
