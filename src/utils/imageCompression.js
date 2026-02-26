import imageCompression from 'browser-image-compression';

/**
 * Comprime una imagen a formato WebP con configuración optimizada para e-commerce.
 * Aplica compresión agresiva en múltiples pasadas si el resultado supera el objetivo.
 *
 * @param {File} file - Archivo de imagen original
 * @param {Object} customOptions - Opciones personalizadas (opcional)
 * @returns {Promise<File>} - Archivo comprimido en formato WebP
 */
export async function compressImage(file, customOptions = {}) {
    // Configuración por defecto — balanceada para catálogos de productos
    const defaultOptions = {
        maxSizeMB: 0.25,               // Objetivo: 250KB (era 500KB — demasiado generoso)
        maxWidthOrHeight: 1200,         // Máximo 1200px (era 1920px, innecesario para e-commerce)
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.80,           // 80% calidad — sweet spot calidad/peso
        alwaysKeepResolution: false,    // Permitir reducción de resolución si necesario
    };

    const options = { ...defaultOptions, ...customOptions };

    try {
        let compressedFile = await imageCompression(file, options);

        // Segunda pasada si aún supera el límite (imágenes muy detalladas como fotos de ropa)
        const limitBytes = options.maxSizeMB * 1024 * 1024;
        if (compressedFile.size > limitBytes * 1.5) {
            console.warn(`[Compresión] Primera pasada: ${(compressedFile.size / 1024).toFixed(0)}KB — aplicando segunda pasada más agresiva`);
            const aggressiveOptions = {
                ...options,
                maxSizeMB: options.maxSizeMB * 0.8,   // 20% más estricto
                initialQuality: Math.max(0.65, (options.initialQuality || 0.80) - 0.15),
                maxWidthOrHeight: Math.min(options.maxWidthOrHeight || 1200, 900),
            };
            const secondPass = await imageCompression(file, aggressiveOptions);
            // Solo usar segunda pasada si efectivamente es más pequeña
            if (secondPass.size < compressedFile.size) {
                compressedFile = secondPass;
                console.info(`[Compresión] Segunda pasada OK: ${(secondPass.size / 1024).toFixed(0)}KB`);
            }
        }

        const ratio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
        console.info(`[Compresión] ${file.name} → ${(compressedFile.size / 1024).toFixed(0)}KB (ahorro: ${ratio}%)`);

        return compressedFile;

    } catch (error) {
        console.error('❌ Error al comprimir imagen:', error);
        throw new Error(`Error al comprimir la imagen: ${error.message}`);
    }
}

/**
 * Comprime una imagen con calidad premium (para logos de tienda).
 * Los logos necesitan nitidez, pero no resoluciones enormes.
 *
 * @param {File} file - Archivo de imagen original
 * @returns {Promise<File>} - Archivo comprimido en formato WebP con calidad premium
 */
export async function compressLogo(file) {
    return compressImage(file, {
        maxSizeMB: 0.15,           // 150KB máximo para logos (era 0.3)
        maxWidthOrHeight: 600,      // 600px suficiente para logos (era 800)
        initialQuality: 0.88,       // Alta calidad para mantener nitidez del logo
    });
}
