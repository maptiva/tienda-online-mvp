// Textos legales para todas las tiendas
// Estos textos son estándar y se aplican a todas las tiendas de Maptiva

export const legalTexts = {
    // Términos del Servicio
    terms: {
        title: 'Términos del Servicio',
        content: `
## Uso general

El comerciante utiliza Maptiva para publicar productos y gestionar su tienda online.
Debe garantizar que la información publicada sea correcta, actualizada y veraz.

## Alcance del servicio

Maptiva ofrece infraestructura tecnológica de bajo costo, orientada a pequeños comercios.
No ofrece servicios logísticos, financieros ni comerciales.

## Limitaciones

El sistema puede presentar fallas técnicas, demoras o interrupciones.
Maptiva no garantiza disponibilidad continua ni resultados comerciales.

## Responsabilidades del comerciante

- Mantener precios y stock actualizados
- Cumplir normativa vigente (AFIP, derecho al consumidor, etc.)
- Atender reclamos, devoluciones y consultas propias de la venta

## Buenas prácticas

Se recomienda revisar periódicamente la información publicada y mantener canales de contacto claros para los clientes.
    `.trim()
    },

    // Política de Privacidad
    privacy: {
        title: 'Política de Privacidad',
        content: `
Esta tienda utiliza la plataforma Maptiva, que recopila datos mínimos necesarios para su funcionamiento (por ejemplo: información provista por el comerciante, datos técnicos de navegación y formularios de contacto).

## Uso de datos

Los datos no se venden ni se comparten con terceros, salvo requerimiento legal.
Su tratamiento se realiza conforme a la Ley de Protección de Datos Personales 25.326 (Argentina).

## Derechos del usuario

Los usuarios pueden solicitar acceso, corrección o eliminación de su información.

## Responsabilidad del contenido

La responsabilidad del contenido cargado recae en el comerciante que administra esta tienda.
    `.trim()
    },

    // Aviso Legal
    legal: {
        title: 'Aviso Legal',
        content: `
Esta tienda online funciona a través de la plataforma **Maptiva**, que brinda herramientas tecnológicas para que pequeños comercios puedan publicar y gestionar sus productos.

## Responsabilidad del contenido

El contenido, los precios, las fotos, la disponibilidad de stock y cualquier información mostrada en esta tienda son provistos y administrados directamente por el comerciante.

Maptiva no controla ni valida esa información y no participa en el proceso de venta, envío, pago o posventa.

## Disponibilidad del servicio

Si bien Maptiva realiza esfuerzos razonables para mantener la plataforma en funcionamiento, no puede garantizar disponibilidad permanente, ausencia de errores técnicos o pérdida de datos.

En caso de inconsistencias o fallas, el comerciante es responsable de verificar y actualizar su información.

## Protección de datos

La protección de datos personales se realiza conforme a la Ley 25.326 (Argentina). Los datos cargados por usuarios y comerciantes son utilizados únicamente para el funcionamiento básico de la plataforma.
    `.trim()
    }
};

// Disclaimer corto para el footer
export const footerDisclaimer =
    'Los precios, stock y contenido son administrados por el comerciante. Ante cualquier duda, contactalo directamente.';
