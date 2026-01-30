// Test para verificar que la función ahora funciona
async function testFixedFunction() {
  console.log('🔍 [FIXED TEST]: Probando la función corregida');
  
  try {
    // Test con producto que SÍ tiene stock (ID 15 - 10 unidades)
    const testItems = [{product_id: 15, quantity: 2}]; // Pedir 2 de 10 disponibles
    
    console.log('🔍 [FIXED TEST]: Items a probar:', testItems);
    
    const result = await supabase.rpc('process_public_cart_sale', {
      p_store_slug: 'baby-sweet',
      p_items: testItems,
      p_order_reference: 'Test Fixed Function'
    });
    
    console.log('✅ [FIXED TEST RESULT]:', result);
    
    if (result.success) {
      console.log('🎉 [FIXED TEST]: ÉXITO TOTAL - La función funciona!');
      console.log('📊 [FIXED TEST]: Productos procesados:', result.processed_items);
      console.log('📊 [FIXED TEST]: Productos fallidos:', result.failed_items);
      console.log('✨ [FIXED TEST]: El flujo de WhatsApp debería funcionar ahora');
    } else {
      console.error('❌ [FIXED TEST]: La función falló:', result);
    }
    
  } catch (error) {
    console.error('🔥 [FIXED TEST ERROR]:', error);
  }
}

// Ejecutar el test
testFixedFunction();