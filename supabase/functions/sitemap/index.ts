
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )

        const baseUrl = 'https://clicando.com.ar'

        // 1. Fetch Active Stores
        const { data: stores, error: storesError } = await supabaseClient
            .from('stores')
            .select('user_id, store_slug, updated_at')
            .eq('is_active', true)

        if (storesError) throw storesError

        // Map user_id -> store_slug for quick lookup
        const storeMap = new Map()
        stores.forEach(store => {
            storeMap.set(store.user_id, store.store_slug)
        })

        // 2. Fetch Active Products (Only those with active stores)
        // We fetch all and filter, or we could filter by user_id list if the list is small. 
        // For now, fetching all is okay for MVP, but pagination might be needed at scale.
        const { data: products, error: productsError } = await supabaseClient
            .from('products')
            .select('id, user_id, updated_at')
        // .eq('is_active', true) // Uncomment if products have is_active

        if (productsError) throw productsError

        // 3. Build XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`

        // Add Stores
        stores.forEach(store => {
            const lastMod = store.updated_at ? store.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]
            xml += `  <url>
    <loc>${baseUrl}/${store.store_slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
        })

        // Add Products
        products.forEach(product => {
            const storeSlug = storeMap.get(product.user_id)
            if (storeSlug) {
                const lastMod = product.updated_at ? product.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]
                xml += `  <url>
    <loc>${baseUrl}/${storeSlug}/product/${product.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
`
            }
        })

        xml += `</urlset>`

        return new Response(xml, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/xml',
            },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
