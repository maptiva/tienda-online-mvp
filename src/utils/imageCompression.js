import imageCompression from 'browser-image-compression';

/**
 * Comprime una imagen a formato WebP con configuración optimizada para e-commerce
 * @param {File} file - Archivo de imagen original
 * @param {Object} customOptions - Opciones personalizadas (opcional)
 * @returns {Promise<File>} - Archivo comprimido en formato WebP
 */
export async function compressImage(file, customOptions = {}) {
    // Configuración por defecto optimizada para e-commerce
    const defaultOptions = {
        maxSizeMB: 0.5,              // Máximo 500KB
        maxWidthOrHeight: 1920,       // Máximo 1920px (Full HD)
        useWebWorker: true,           // Usar Web Worker para no bloquear UI
        fileType: 'image/webp',       // Convertir a WebP
        initialQuality: 0.85          // 85% de calidad (sweet spot)
    };

    // Combinar opciones por defecto con personalizadas
    const options = { ...defaultOptions, ...customOptions };

    try {
        console.log('📸 Comprimiendo imagen:', {
            nombre: file.name,
            tamañoOriginal: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            tipo: file.type
        });

        const compressedFile = await imageCompression(file, options);

        console.log('✅ Compresión exitosa:', {
            tamañoComprimido: `${(compressedFile.size / 1024).toFixed(2)} KB`,
            ahorro: `${((file.size - compressedFile.size) / file.size * 100).toFixed(1)}%`,
            formato: compressedFile.type
        });

        return compressedFile;
    } catch (error) {
        console.error('❌ Error al comprimir imagen:', error);
        throw new Error(`Error al comprimir la imagen: ${error.message}`);
    }
}

/**
 * Comprime una imagen con calidad premium (para logos de tienda)
 * @param {File} file - Archivo de imagen original
 * @returns {Promise<File>} - Archivo comprimido en formato WebP con calidad 90%
 */
export async function compressLogo(file) {
    return compressImage(file, {
        maxSizeMB: 0.3,         // Logos más pequeños
        maxWidthOrHeight: 800,   // Logos no necesitan ser tan grandes
        initialQuality: 0.90     // Calidad premium para logos
    });
}
