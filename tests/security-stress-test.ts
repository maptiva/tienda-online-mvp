import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

const TIENDA_A = 'ruwaq-disenos';
const PRODUCTO_A = 1003; // Válido para Tienda A
const PRODUCTO_B = 406;  // Malicioso (es de Tienda 'koketos')

interface TestCase {
  name: string;
  payload: [string, { name: string }, Array<{ product_id: number; quantity: number }>, number, string, number];
  expected: 'success' | 'error';
  note?: string;
}

interface RpcResult {
  success: boolean;
  error?: string;
  order_id?: string;
  verified_total?: number;
}

async function runTests() {
  console.log('🚀 INICIANDO STRESS TEST DE SEGURIDAD (V3.1)\n');

  const tests: TestCase[] = [
    {
      name: '1. Pedido Normal (Happy Path)',
      payload: [TIENDA_A, { name: 'Test' }, [{ product_id: PRODUCTO_A, quantity: 1 }], 1000, 'cash', 0],
      expected: 'success'
    },
    {
      name: '4. Ataque: Manipulación de Precio ($0.01)',
      payload: [TIENDA_A, { name: 'Hacker' }, [{ product_id: PRODUCTO_A, quantity: 1 }], 0.01, 'cash', 0],
      expected: 'success',
      note: 'Debe aceptar, pero el verificado_total en DB debe ser el real.'
    },
    {
      name: '5. Ataque: Descuento Excesivo ($99999)',
      payload: [TIENDA_A, { name: 'Hacker' }, [{ product_id: PRODUCTO_A, quantity: 1 }], 1000, 'cash', 99999],
      expected: 'error'
    },
    {
      name: '6. Ataque: Descuento Negativo (-10)',
      payload: [TIENDA_A, { name: 'Hacker' }, [{ product_id: PRODUCTO_A, quantity: 1 }], 1000, 'cash', -10],
      expected: 'error'
    },
    {
      name: '7. Ataque: Cross-store Injection (Producto de Tienda B)',
      payload: [TIENDA_A, { name: 'Hacker' }, [{ product_id: PRODUCTO_B, quantity: 1 }], 1000, 'cash', 0],
      expected: 'error'
    },
    {
      name: '8. Ataque: Tienda Inexistente',
      payload: ['tienda-fantasma-123', { name: 'Test' }, [{ product_id: PRODUCTO_A, quantity: 1 }], 1000, 'cash', 0],
      expected: 'error'
    },
    {
      name: '11. Ataque: Pedido Vacío ([])',
      payload: [TIENDA_A, { name: 'Test' }, [], 0, 'cash', 0],
      expected: 'error'
    }
  ];

  for (const t of tests) {
    console.log(`Testing: ${t.name}...`);
    try {
      const { data, error } = await supabase.rpc('create_public_order', {
        p_store_slug: t.payload[0],
        p_customer_info: t.payload[1],
        p_items: t.payload[2],
        p_client_total: t.payload[3],
        p_payment_method: t.payload[4],
        p_discount_applied: t.payload[5]
      });

      if (error) {
        console.log(`  ❌ RPC Error: ${error.message}`);
      } else {
        const rpcData = data as RpcResult;
        if (rpcData.success) {
          console.log(`  ✅ ÉXITO: Pedido creado (ID: ${rpcData.order_id?.slice(-6)}, Total Verificado: $${rpcData.verified_total})`);
          if (t.expected === 'error') console.log('  ⚠️ ALERTA: Este test debía fallar pero pasó.');
        } else {
          console.log(`  🛡️ BLOQUEADO: ${rpcData.error}`);
          if (t.expected === 'success') console.log('  ⚠️ ALERTA: Este test debía pasar pero falló.');
        }
      }
    } catch (err) {
      console.log(`  🔥 Error Inesperado: ${err instanceof Error ? err.message : String(err)}`);
    }
    console.log('--------------------------------------------------');
  }
}

runTests();
