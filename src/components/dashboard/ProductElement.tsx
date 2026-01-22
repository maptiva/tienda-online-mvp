import React, { useState } from 'react'
import { Product } from '../../interfaces/Producto'
import { useNavigate } from 'react-router-dom'
import { RiPencilLine } from 'react-icons/ri';
import { MdOutlineDelete } from 'react-icons/md';
import { deleteProduct } from '../../hooks/useProductDelete';
import Swal from 'sweetalert2';

interface Props {
    product: Product
}

export const ProductElement = ({ product }: Props) => {
    const { id, name, price, image_url, categories } = product
    const navigate = useNavigate();
    const [estado, setEstado] = useState<boolean>(true);


    const handleDlete = async () => {

        const { isConfirmed } = await Swal.fire({
            title: `Seguro quiere elimnar el producto ${name}`,
            confirmButtonText: 'Aceptar',
            showCancelButton: true
        });

        if (isConfirmed) {
            const eliminado = await deleteProduct(id, image_url)

            if (eliminado) {
                setEstado(false);
            };

        };
    }

    return (
        <tr key={id} className={`text-center py-2 ${!estado ? 'hidden' : ''} border-b border-gray-200 hover:bg-gray-50 transition-colors`}>
            <td className='py-3 text-sm font-mono text-gray-500'>
                {product.sku ? product.sku : `#${id}`}
            </td>
            <td className='py-3'>
                <div className="flex justify-start">
                    {image_url ? (
                        <img
                            src={image_url}
                            alt={name}
                            className="w-10 h-10 object-cover rounded-md border border-gray-200 shadow-sm"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                            Sin foto
                        </div>
                    )}
                </div>
            </td>
            <td className='py-3 text-lg font-medium text-gray-800 text-left'>{name}</td>
            <td className='py-3 text-lg text-gray-700'>${price.toLocaleString()}</td>
            <td className='py-3 text-lg text-gray-500'>{categories?.name}</td>
            <td className='py-3'>
                <div className='gap-4 flex items-center justify-center'>
                    <button className='cursor-pointer text-gray-500 hover:text-blue-600 transition-all duration-300 outline-none' onClick={(e) => navigate(`/admin/edit/${id}`)}>
                        <RiPencilLine size={22} />
                    </button>
                    <button className='cursor-pointer text-red-500 hover:text-red-700 transition-all duration-300 outline-none' onClick={handleDlete}>
                        <MdOutlineDelete size={22} />
                    </button>
                </div>
            </td>
        </tr>
    )
}
