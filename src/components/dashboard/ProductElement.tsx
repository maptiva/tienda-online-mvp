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
            <td className='py-3 text-lg'>{id}</td>
            <td className='py-3 text-lg font-medium text-gray-800'>{name}</td>
            <td className='py-3 text-lg text-gray-700'>${price.toLocaleString()}</td>
            <td className='py-3 text-lg text-gray-500'>{categories?.name}</td>
            <td className='py-3'>
                <div className='gap-4 flex items-center justify-center'>
                    <button className='cursor-pointer hover:text-blue-600 transition-all duration-300' onClick={(e) => navigate(`/admin/edit/${id}`)}>
                        <RiPencilLine size={22} />
                    </button>
                    <button className='cursor-pointer hover:text-red-600 transition-all duration-300' onClick={handleDlete}>
                        <MdOutlineDelete size={22} />
                    </button>
                </div>
            </td>
        </tr>
    )
}
