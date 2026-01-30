import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const storeSlug = 'baby-sweet';
  const orderRef = `CI_TEST_${Date.now()}`;
  console.log('Running inventory CI test against store', storeSlug, 'orderRef', orderRef);

  // 1) Get store owner (user_id)
  const { data: store, error: storeErr } = await supabase
    .from('stores')
    .select('user_id')
    .eq('store_slug', storeSlug)
    .single();

  if (storeErr || !store) throw new Error('Store not found: ' + (storeErr?.message || 'no store'));
  const userId = store.user_id;

  const testCases = [
    { product_id: 15, quantity: 2, expectSuccess: true },
    { product_id: 17, quantity: 5, expectSuccess: false },
    { product_id: 16, quantity: 1, expectSuccess: false }
  ];

  // Backup current inventory
  const backups = {};
  for (const t of testCases) {
    const { data: inv, error: invErr } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', t.product_id)
      .eq('user_id', userId)
      .single();

    if (invErr && invErr.code === 'PGRST116') {
      backups[t.product_id] = null;
    } else if (invErr) {
      throw invErr;
    } else {
      backups[t.product_id] = { id: inv.id, quantity: inv.quantity, reserved_quantity: inv.reserved_quantity };
    }
  }

  try {
    for (const t of testCases) {
      console.log('Testing', t);
      const items = [{ product_id: t.product_id, quantity: t.quantity }];

      const { data, error } = await supabase.rpc('process_public_cart_sale', {
        p_store_slug: storeSlug,
        p_items: items,
        p_order_reference: orderRef
      });

      if (error) {
        console.error('RPC error', error);
        throw error;
      }

      if (t.expectSuccess) {
        if (!data.success) throw new Error(`Expected success for product ${t.product_id} but got ${JSON.stringify(data)}`);

        // Results may be JSON object with 'results' as array/JSON string
        let resArray = data.results;
        if (!Array.isArray(resArray)) {
          try { resArray = JSON.parse(resArray); } catch (e) { resArray = []; }
        }

        const resultItem = resArray.find(r => Number(r.product_id) === Number(t.product_id));
        if (!resultItem || !resultItem.success) throw new Error(`Expected item success, got ${JSON.stringify(resultItem)}`);

        // verify DB
        const { data: invAfter } = await supabase
          .from('inventory')
          .select('*')
          .eq('product_id', t.product_id)
          .eq('user_id', userId)
          .single();

        const expectedQty = (backups[t.product_id]?.quantity ?? 0) - t.quantity;
        if (invAfter.quantity !== expectedQty) throw new Error(`Inventory mismatch for ${t.product_id}: expected ${expectedQty}, got ${invAfter.quantity}`);

        console.log('Success verified for', t.product_id);
      } else {
        // expecting failure: either overall success false or the particular item failed
        if (data.success) throw new Error(`Expected failure for product ${t.product_id} but rpc success true`);
        console.log('Failure correctly reported for', t.product_id);
      }
    }

    console.log('All test cases passed.');
  } finally {
    // Cleanup: restore inventory quantities and delete logs for this orderRef
    console.log('Cleaning up: restoring inventory and removing logs with orderRef', orderRef);
    for (const pidStr of Object.keys(backups)) {
      const pid = Number(pidStr);
      const b = backups[pid];
      if (b) {
        const { error } = await supabase
          .from('inventory')
          .update({ quantity: b.quantity, reserved_quantity: b.reserved_quantity, updated_at: new Date().toISOString() })
          .eq('id', b.id);
        if (error) console.error('Error restoring inventory for', pid, error);
      }
    }

    const reason = `Venta Pública - ${orderRef}`;
    const { error: delErr } = await supabase.from('inventory_logs').delete().eq('reason', reason);
    if (delErr) console.error('Error deleting logs', delErr);
  }
}

run().catch(err => { console.error('Test failed:', err); process.exit(1); });
