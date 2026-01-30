// Test manual para verificar que la función RPC funciona correctamente
// Pega esto en la consola del navegador en la tienda de Baby Sweet

async function testStockFunction() {
  console.log('🔍 [TEST]: Iniciando test de la función RPC');
  
  try {
    // Test 1: Verificar que existe un producto con stock
    const testItems = [{product_id: 1, quantity: 1}]; // Cambiar por un ID real
    
    console.log('🔍 [TEST]: Items a probar:', testItems);
    
    const result = await inventoryService.processPublicCartSale('baby-sweet', testItems, 'Test Manual');
    
    console.log('✅ [TEST]: Resultado exitoso:', result);
    
    // Verificar el estado del stock después del test
    console.log('🔍 [TEST]: Verificando estado actual del stock...');
    
  } catch (error) {
    console.error('🔥 [TEST]: Error en test:', error);
  }
}

// Ejecutar el test
testStockFunction();