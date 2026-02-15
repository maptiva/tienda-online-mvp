/**
 * 🔒 Public Security Test Suite - Clicando
 * Este script simula ataques de "fuga de datos" entre tiendas (Cross-tenant leaks).
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Variables de entorno faltantes.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runSecurityTests() {
    console.log('🧪 Iniciando pruebas de penetración en RPC Públicos...');

    try {
        // 1. Obtener dos tiendas reales para simular el ataque
        const { data: stores, error: sErr } = await supabase
            .from('stores')
            .select('store_slug, user_id')
            .limit(2);

        if (sErr || !stores || stores.length < 2) {
            console.warn('⚠️ Se necesitan al menos 2 tiendas en la DB para completar el test de aislamiento.');
            process.exit(0);
        }

        const tiendaA = stores[0];
        const tiendaB = stores[1];

        console.log(`Tienda A: ${tiendaA.store_slug}`);
        console.log(`Tienda B: ${tiendaB.store_slug}`);

        // 2. Obtener un producto que pertenezca a Tienda B
        const { data: prodB, error: pErr } = await supabase
            .from('products')
            .select('id')
            .eq('user_id', tiendaB.user_id)
            .limit(1)
            .single();

        if (pErr || !prodB) {
            console.warn(`⚠️ No se encontró productos para ${tiendaB.store_slug}, saltando ataque cruzado.`);
        } else {
            // 🕵️ ATAQUE: Intentar obtener stock del producto de B usando el slug de A
            console.log(`🕵️ INTENTO DE ATAQUE: Pidiendo Producto de B (${prodB.id}) usando Slug de A (${tiendaA.store_slug})...`);

            const { data, error } = await supabase.rpc('get_public_inventory', {
                p_store_slug: tiendaA.store_slug,
                p_product_id: prodB.id
            });

            if (data && data.length > 0) {
                console.error('🚨 FALLO DE SEGURIDAD: Se obtuvo información de un producto ajeno a la tienda.');
                process.exit(1);
            } else {
                console.log('✅ BLOQUEO EXITOSO: El sistema denegó el acceso al producto cruzado.');
            }
        }

        // 3. Test de Slug inexistente
        console.log('🧪 Test: Slug de tienda inexistente...');
        const { data: emptyData } = await supabase.rpc('get_public_inventory', {
            p_store_slug: 'tienda-fantasma-12345',
            p_product_id: 1
        });

        if (emptyData && emptyData.length > 0) {
            console.error('🚨 FALLO: Se devolvió información para una tienda que no existe.');
            process.exit(1);
        }
        console.log('✅ EXITOSO: Tienda fantasma no devuelve datos.');

        console.log('\n✨ Todas las pruebas de seguridad pública han PASADO.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error inesperado durante el test:', err.message);
        process.exit(1);
    }
}

runSecurityTests();
