import React, { useState } from 'react';
import { Product } from '../../interfaces/Producto';
import { useNavigate } from 'react-router-dom';
import { RiPencilLine } from 'react-icons/ri';
import { MdOutlineDelete } from 'react-icons/md';
import { deleteProduct } from '../../hooks/useProductDelete';
import Swal from 'sweetalert2';

interface Props {
    product: Product;
}

export const ProductCard = ({ product }: Props) => {
    const { id, name, price, image_url, categories } = product;
    const navigate = useNavigate();
    const [estado, setEstado] = useState<boolean>(true);

    const handleDelete = async () => {
        const { isConfirmed } = await Swal.fire({
            title: `¿Seguro que quieres eliminar "${name}"?`,
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#ef4444',
            showCancelButton: true,
            cancelButtonText: 'Cancelar'
        });

        if (isConfirmed) {
            const eliminado = await deleteProduct(id, image_url);

            if (eliminado) {
                setEstado(false);
            }
        }
    };

    if (!estado) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-4">
                {/* Imagen */}
                <div className="flex-shrink-0">
                    {image_url ? (
                        <img
                            src={image_url}
                            alt={name}
                            className="w-20 h-20 object-cover rounded-md border border-gray-200"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                            Sin foto
                        </div>
                    )}
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate mb-1">{name}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                        <span className="font-medium">Categoría:</span> {categories?.name || 'Sin categoría'}
                    </p>
                    <p className="text-xl font-bold text-[#5FAFB8]">${price.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {product.sku ? `SKU: ${product.sku}` : `ID: #${id}`}
                    </p>
                </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                    onClick={() => navigate(`/admin/edit/${id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                    <RiPencilLine size={18} />
                    Editar
                </button>
                <button
                    onClick={handleDelete}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                    <MdOutlineDelete size={18} />
                    Eliminar
                </button>
            </div>
        </div>
    );
};
