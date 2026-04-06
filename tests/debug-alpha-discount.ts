import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function testAlphaWithDiscount() {
  const STORE = 'alpha-athletics';
  const PRODUCTO_ID = 7; // Short de Alpha ($32,000)
  const SUB_TOTAL = 32000;
  const DESCUENTO_10 = 3200; // 10%
  const CLIENT_TOTAL = SUB_TOTAL - DESCUENTO_10; // 28800

  console.log(`🚀 Probando pedido en ${STORE} con 10% OFF ($${DESCUENTO_10})...`);

  const { data, error } = await supabase.rpc('create_public_order', {
    p_store_slug: STORE,
    p_customer_info: { name: 'Debugger Discount', phone: '123' },
    p_items: [{ product_id: PRODUCTO_ID, quantity: 1 }],
    p_client_total: CLIENT_TOTAL,
    p_payment_method: 'cash',
    p_discount_applied: DESCUENTO_10
  });

  if (error) {
    console.error('❌ Error de RPC:', error.message);
  } else {
    const rpcData = data as { success: boolean; error?: string };
    if (rpcData.success) {
      console.log('✅ ÉXITO:', rpcData);
    } else {
      console.log('🛡️ BLOQUEADO POR REGLA:', rpcData.error);
    }
  }
}

testAlphaWithDiscount();
