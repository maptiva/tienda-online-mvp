/**
 * ProductImage - Componente reutilizable para mostrar imágenes de productos
 * 
 * Maneja de forma consistente:
 * - Imágenes válidas
 * - Imágenes con error de carga
 * - Productos sin imagen (muestra "Sin Imagen")
 * 
 * Uso:
 * <ProductImage src={product.image_url} alt={product.name} />
 * <ProductImage src={product.image_url} alt={product.name} size="large" />
 */

import React from 'react';

const ProductImage = ({
    src,
    alt = 'Producto',
    size = 'medium',
    className = '',
    onClick,
    showHoverEffect = true
}) => {

    // Clases base según tamaño
    const sizeClasses = {
        small: 'w-16 h-16',
        medium: 'w-full aspect-square',
        large: 'w-full aspect-square',
    };

    // Si no hay imagen, mostrar placeholder "Sin Imagen"
    if (!src) {
        return (
            <div
                className={`
          ${sizeClasses[size]} 
          flex items-center justify-center 
          bg-gray-100 dark:bg-slate-700 
          ${className}
        `}
                onClick={onClick}
            >
                <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">
                    Sin Imagen
                </span>
            </div>
        );
    }

    // Si hay imagen, mostrar con manejo de error
    return (
        <img
            src={src}
            alt={alt}
            className={`
        ${sizeClasses[size]} 
        object-cover 
        ${showHoverEffect ? 'group-hover:scale-110 transition-transform duration-300' : ''}
        ${className}
      `}
            onError={(e) => {
                // Cuando la imagen falla, reemplazar con "Sin Imagen"
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                if (parent) {
                    parent.innerHTML = `
            <div class="${sizeClasses[size]} flex items-center justify-center bg-gray-100 dark:bg-slate-700">
              <span class="text-gray-400 dark:text-gray-500 text-sm font-medium">Sin Imagen</span>
            </div>
          `;
                }
            }}
            onClick={onClick}
        />
    );
};

export default ProductImage;
