// Test específico con datos reales de Baby Sweet
async function testStockReal() {
  console.log('🔍 [TEST]: Iniciando test con datos reales de Baby Sweet');
  
  try {
    // Test 1: Producto con stock suficiente (ID 15 - 10 unidades)
    console.log('🔍 [TEST 1]: Probando producto CON stock suficiente');
    const testItems1 = [{product_id: 15, quantity: 2}]; // Pedir 2 de 10 disponibles
    
    console.log('🔍 [TEST 1]: Items a probar:', testItems1);
    
    const result1 = await inventoryService.processPublicCartSale('baby-sweet', testItems1, 'Test Manual - Stock Suficiente');
    
    console.log('✅ [TEST 1 RESULT]:', result1);
    
    // Test 2: Producto con stock insuficiente (ID 17 - 2 unidades)
    console.log('🔍 [TEST 2]: Probando producto CON stock insuficiente');
    const testItems2 = [{product_id: 17, quantity: 5}]; // Pedir 5 de solo 2 disponibles
    
    console.log('🔍 [TEST 2]: Items a probar:', testItems2);
    
    const result2 = await inventoryService.processPublicCartSale('baby-sweet', testItems2, 'Test Manual - Stock Insuficiente');
    
    console.log('✅ [TEST 2 RESULT]:', result2);
    
    // Test 3: Producto agotado (ID 16 - 0 unidades)
    console.log('🔍 [TEST 3]: Probando producto AGOTADO');
    const testItems3 = [{product_id: 16, quantity: 1}]; // Pedir 1 de 0 disponibles
    
    console.log('🔍 [TEST 3]: Items a probar:', testItems3);
    
    const result3 = await inventoryService.processPublicCartSale('baby-sweet', testItems3, 'Test Manual - Agotado');
    
    console.log('✅ [TEST 3 RESULT]:', result3);
    
    console.log('🎯 [TEST COMPLETADO]: Todos los tests finalizados');
    
  } catch (error) {
    console.error('🔥 [TEST ERROR]: Error en testing:', error);
  }
}

// Ejecutar el test
testStockReal();