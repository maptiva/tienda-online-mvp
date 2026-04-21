/**
 * ProductImage - Componente reutilizable para mostrar imágenes de productos
 */

import React from 'react';

interface ProductImageProps {
    src?: string | null;
    alt?: string;
    variant?: 'card' | 'detail'; // 'card' para cards (cuadrado), 'detail' para detalle (proporción original)
    className?: string;
    onClick?: () => void;
    showHoverEffect?: boolean;
}

const ProductImage: React.FC<ProductImageProps> = ({
    src,
    alt = 'Producto',
    variant = 'card',
    className = '',
    onClick,
    showHoverEffect = true
}) => {

    // Clases base según variante
    const variantClasses = {
        card: 'w-full aspect-square object-cover',
        detail: 'w-full h-auto object-contain',
    };

    // Clases para el contenedor "Sin Imagen"
    const containerClasses = {
        card: 'w-full aspect-square',
        detail: 'w-full aspect-square',
    };

    // Si no hay imagen, mostrar placeholder "Sin Imagen"
    if (!src) {
        return (
            <div
                className={`
                    ${containerClasses[variant]}
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
            loading="lazy"
            decoding="async"
            className={`
                ${variantClasses[variant]} 
                ${showHoverEffect ? 'group-hover:scale-110 transition-transform duration-300' : ''}
                ${className}
            `}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                // Cuando la imagen falla, reemplazar con "Sin Imagen"
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                    const errorContainer = document.createElement('div');
                    errorContainer.className = `${containerClasses[variant]} flex items-center justify-center bg-gray-100 dark:bg-slate-700`;
                    errorContainer.innerHTML = `<span class="text-gray-400 dark:text-gray-500 text-sm font-medium">Sin Imagen</span>`;
                    parent.appendChild(errorContainer);
                }
            }}
            onClick={onClick}
        />
    );
};

export default ProductImage;
