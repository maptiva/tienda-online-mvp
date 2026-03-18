import imageCompression from 'browser-image-compression';

/**
 * Opciones de compresión de imagen compatibles con browser-image-compression
 */
export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    fileType?: string;
    initialQuality?: number;
    alwaysKeepResolution?: boolean;
}

/**
 * Comprime una imagen a formato WebP con configuración optimizada para e-commerce.
 * Aplica compresión agresiva en múltiples pasadas si el resultado supera el objetivo.
 *
 * @param file - Archivo de imagen original
 * @param customOptions - Opciones personalizadas (opcional)
 * @returns Promesa con el archivo comprimido en formato WebP
 */
export async function compressImage(file: File, customOptions: CompressionOptions = {}): Promise<File> {
    // Configuración por defecto — balanceada para catálogos de productos
    const defaultOptions: CompressionOptions = {
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
        const limitBytes = (options.maxSizeMB ?? 0.25) * 1024 * 1024;
        if (compressedFile.size > limitBytes * 1.5) {
            console.warn(`[Compresión] Primera pasada: ${(compressedFile.size / 1024).toFixed(0)}KB — aplicando segunda pasada más agresiva`);
            const aggressiveOptions: CompressionOptions = {
                ...options,
                maxSizeMB: (options.maxSizeMB ?? 0.25) * 0.8,   // 20% más estricto
                initialQuality: Math.max(0.65, (options.initialQuality ?? 0.80) - 0.15),
                maxWidthOrHeight: Math.min(options.maxWidthOrHeight ?? 1200, 900),
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
        console.error('Error al comprimir imagen:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al comprimir';
        throw new Error(`Error al comprimir la imagen: ${errorMessage}`);
    }
}

/**
 * Comprime una imagen con calidad premium (para logos de tienda).
 * Los logos necesitan nitidez, pero no resoluciones enormes.
 *
 * @param file - Archivo de imagen original
 * @returns Promesa con el archivo comprimido en formato WebP con calidad premium
 */
export async function compressLogo(file: File): Promise<File> {
    return compressImage(file, {
        maxSizeMB: 0.15,           // 150KB máximo para logos (era 0.3)
        maxWidthOrHeight: 600,      // 600px suficiente para logos (era 800)
        initialQuality: 0.88,       // Alta calidad para mantener nitidez del logo
    });
}
