import { NextResponse } from 'next/server';

// Lista de user agents de bots de redes sociales
const BOT_USER_AGENTS = [
    'facebookexternalhit',
    'WhatsApp',
    'Twitterbot',
    'LinkedInBot',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'SkypeUriPreview',
];

export async function middleware(request) {
    const userAgent = request.headers.get('user-agent') || '';
    const url = new URL(request.url);

    // Detectar si es un bot de redes sociales
    const isBot = BOT_USER_AGENTS.some(bot =>
        userAgent.toLowerCase().includes(bot.toLowerCase())
    );

    // Solo procesar si es un bot y la ruta parece ser una tienda
    if (isBot && url.pathname !== '/' && !url.pathname.startsWith('/admin') && !url.pathname.startsWith('/mapa')) {
        try {
            // Extraer el nombre de la tienda del path
            const pathParts = url.pathname.split('/').filter(Boolean);
            const storeName = pathParts[0];

            // Fetch de los datos de la tienda desde Supabase
            const supabaseUrl = process.env.VITE_SUPABASE_URL;
            const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(
                `${supabaseUrl}/rest/v1/stores?store_slug=eq.${storeName}&select=*`,
                {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                    },
                }
            );

            const stores = await response.json();
            const store = stores[0];

            if (store) {
                // Construir URL absoluta del logo
                const logoUrl = store.logo_url?.startsWith('http')
                    ? store.logo_url
                    : `${url.origin}${store.logo_url}`;

                // HTML con meta tags pre-renderizados
                const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${store.store_name} - Catálogo Online</title>
  <meta name="description" content="Descubre los productos de ${store.store_name}. Navega nuestro catálogo completo y realiza tu pedido por WhatsApp. ¡Compra fácil y rápido!">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url.href}">
  <meta property="og:title" content="${store.store_name} - Catálogo Online">
  <meta property="og:description" content="Descubre los productos de ${store.store_name}. Navega nuestro catálogo completo y realiza tu pedido por WhatsApp. ¡Compra fácil y rápido!">
  <meta property="og:image" content="${logoUrl}">
  <meta property="og:image:secure_url" content="${logoUrl}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Logo de ${store.store_name}">
  <meta property="og:site_name" content="${store.store_name}">
  <meta property="og:locale" content="es_AR">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:url" content="${url.href}">
  <meta name="twitter:title" content="${store.store_name} - Catálogo Online">
  <meta name="twitter:description" content="Descubre los productos de ${store.store_name}. Navega nuestro catálogo completo y realiza tu pedido por WhatsApp. ¡Compra fácil y rápido!">
  <meta name="twitter:image" content="${logoUrl}">
  
  <!-- Redirect to actual app for bots that execute JS -->
  <meta http-equiv="refresh" content="0;url=${url.href}">
</head>
<body>
  <h1>${store.store_name}</h1>
  <p>Cargando...</p>
  <script>window.location.href = "${url.href}";</script>
</body>
</html>`;

                return new NextResponse(html, {
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
                    },
                });
            }
        } catch (error) {
            console.error('Error in middleware:', error);
            // Si hay error, continuar con la request normal
        }
    }

    // Para usuarios normales o si no se pudo procesar, continuar normalmente
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
