const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.development' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const STORE_ID = 1;
const STORE_SLUG = 'alpha-athletics';

const DEMO_PRODUCTS = [
    { product_id: 7, name: 'Short Deportivo "Kinetic" 2 en 1', price: 42000 },
    { product_id: 8, name: 'Remera Técnica "DryFit" Pro', price: 35000 },
    { product_id: 9, name: 'Calza de Compresión "Core"', price: 38000 },
    { product_id: 10, name: 'Musculosa de Entrenamiento', price: 28000 }
];

const CUSTOMERS = [
    { name: 'Juan Pérez', phone: '1122334455', address: 'Av. Corrientes 1234, CABA' },
    { name: 'María García', phone: '1133445566', address: 'Calle Falsa 123, Córdoba' },
    { name: 'Carlos López', phone: '1144556677', address: 'Belgrano 456, Rosario' },
    { name: 'Ana Martínez', phone: '1155667788', address: 'San Martín 789, Mendoza' },
    { name: 'Roberto Sánchez', phone: '1166778899', address: 'Rivadavia 101, Salta' }
];

const PAYMENTS = ['efectivo', 'transferencia', 'whatsapp'];
const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

async function generateOrders() {
    console.log('🚀 Iniciando generación de pedidos demo para Alpha Athletics...');

    for (let i = 0; i < 10; i++) {
        const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
        const numItems = Math.floor(Math.random() * 3) + 1;
        const items = [];
        let subtotal = 0;

        for (let j = 0; j < numItems; j++) {
            const prod = DEMO_PRODUCTS[Math.floor(Math.random() * DEMO_PRODUCTS.length)];
            const qty = Math.floor(Math.random() * 2) + 1;
            items.push({
                product_id: prod.product_id,
                name: prod.name,
                price: prod.price,
                quantity: qty
            });
            subtotal += prod.price * qty;
        }

        const paymentMethod = PAYMENTS[Math.floor(Math.random() * PAYMENTS.length)];
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        const discount = paymentMethod !== 'whatsapp' ? Math.floor(subtotal * 0.1) : 0;
        const total = subtotal - discount;

        const { data, error } = await supabase.from('orders').insert([{
            store_id: STORE_ID,
            customer_info: customer,
            items: items,
            total: total,
            payment_method: paymentMethod,
            discount_applied: discount,
            status: status,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString()
        }]);

        if (error) {
            console.error(`❌ Error al crear pedido ${i + 1}:`, error.message);
        } else {
            console.log(`✅ Pedido ${i + 1} creado para ${customer.name} (Total: $${total})`);
        }
    }

    console.log('✨ Proceso finalizado.');
}

generateOrders();
