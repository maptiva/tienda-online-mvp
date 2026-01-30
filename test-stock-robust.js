// Test robusto para verificar la función RPC directamente
async function testStockRPCDirect() {
  console.log('🔍 [RPC TEST]: Iniciando test directo de RPC');
  
  try {
    // Importar Supabase directamente
    const { supabase } = await import('./src/services/supabase.js');
    
    console.log('🔍 [RPC TEST]: Supabase importado');
    
    // Test 1: Producto con stock suficiente (ID 15 - 10 unidades)
    console.log('🔍 [RPC TEST 1]: Probando producto CON stock suficiente');
    const testItems1 = [{product_id: 15, quantity: 2}]; // Pedir 2 de 10 disponibles
    
    console.log('🔍 [RPC TEST 1]: Items a probar:', testItems1);
    
    const result1 = await supabase.rpc('process_public_cart_sale', {
      p_store_slug: 'baby-sweet',
      p_items: testItems1,
      p_order_reference: 'Test Manual - Stock Suficiente'
    });
    
    console.log('✅ [RPC TEST 1 RESULT]:', result1);
    
    // Test 2: Producto con stock insuficiente (ID 17 - 2 unidades)
    console.log('🔍 [RPC TEST 2]: Probando producto CON stock insuficiente');
    const testItems2 = [{product_id: 17, quantity: 5}]; // Pedir 5 de solo 2 disponibles
    
    console.log('🔍 [RPC TEST 2]: Items a probar:', testItems2);
    
    const result2 = await supabase.rpc('process_public_cart_sale', {
      p_store_slug: 'baby-sweet',
      p_items: testItems2,
      p_order_reference: 'Test Manual - Stock Insuficiente'
    });
    
    console.log('✅ [RPC TEST 2 RESULT]:', result2);
    
    // Test 3: Producto agotado (ID 16 - 0 unidades)
    console.log('🔍 [RPC TEST 3]: Probando producto AGOTADO');
    const testItems3 = [{product_id: 16, quantity: 1}]; // Pedir 1 de 0 disponibles
    
    console.log('🔍 [RPC TEST 3]: Items a probar:', testItems3);
    
    const result3 = await supabase.rpc('process_public_cart_sale', {
      p_store_slug: 'baby-sweet',
      p_items: testItems3,
      p_order_reference: 'Test Manual - Agotado'
    });
    
    console.log('✅ [RPC TEST 3 RESULT]:', result3);
    
    console.log('🎯 [RPC TEST]: Todos los tests completados exitosamente');
    
    // Verificar estado actual del stock después de los tests
    console.log('🔍 [RPC TEST]: Verificando estado del stock...');
    
    const checkResult = await supabase.rpc('get_public_inventory', {
      p_store_slug: 'baby-sweet',
      p_product_id: 15
    });
    
    console.log('🔍 [RPC TEST]: Stock actual del producto 15:', checkResult);
    
  } catch (error) {
    console.error('🔥 [RPC TEST ERROR]: Error en testing de RPC:', error);
  }
}

// Test del flujo del carrito corregido
async function testCartFlow() {
  console.log('🔍 [CART TEST]: Iniciando test del flujo del carrito');
  
  try {
    // Simular el contexto del carrito
    const mockCart = [
      {
        product: {
          id: 15,
          name: 'Conjunto "Aventura" de Blusa y Leggings'
        },
        quantity: 2
      }
    ];
    
    console.log('🔍 [CART TEST]: Carrito simulado:', mockCart);
    
    // Test con el CartModal real
    const itemsToProcess = mockCart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }));
    
    console.log('🔍 [CART TEST]: Items a procesar:', itemsToProcess);
    
    // Llamar a la función RPC directamente
    const { supabase } = await import('./src/services/supabase.js');
    
    const result = await supabase.rpc('process_public_cart_sale', {
      p_store_slug: 'baby-sweet',
      p_items: itemsToProcess,
      p_order_reference: 'Test Cart Flow'
    });
    
    console.log('✅ [CART TEST RESULT]:', result);
    
  } catch (error) {
    console.error('🔥 [CART TEST ERROR]:', error);
  }
}

// Ejecutar ambos tests
async function runAllTests() {
  console.log('🚀 [ALL TESTS]: Iniciando todos los tests');
  
  await testStockRPCDirect();
  await testCartFlow();
  
  console.log('🎯 [ALL TESTS]: Tests completados');
}

// Ejecutar todo
runAllTests();