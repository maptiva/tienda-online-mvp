import React, { useState } from 'react'
import { Product } from '../../interfaces/Producto'
import { useNavigate } from 'react-router-dom'
import { RiPencilLine } from 'react-icons/ri';
import { MdOutlineDelete } from 'react-icons/md';
import { useProductDelete } from '../../hooks/useProductDelete';
import Swal from 'sweetalert2';

interface Props {
    product: Product
}

export const ProductElement = ({ product }: Props) => {
    const { id, category, name, price, image_url } = product
    const navigate = useNavigate();
    const [estado, setEstado] = useState<boolean>(true);


    const handleDlete = async () => {

        const { isConfirmed } = await Swal.fire({
            title: `Seguro quiere elimnar el producto ${name}`,
            confirmButtonText: 'Aceptar',
            showCancelButton: true
        });

        if (isConfirmed) {
            const eliminado = await useProductDelete(id, image_url)

            if (eliminado) {
                setEstado(false);
            };

        };
    }

    return (
        <tr key={id} className={`text-center py-2 ${!estado ? 'hidden' : ''}`}>
            <td className='py-2 text-lg border-y border-slate-400'>{id}</td>
            <td className='py-2 text-lg border-y border-slate-400'>{name}</td>
            <td className='py-2 text-lg border-y border-slate-400'>${price.toFixed(2)}</td>
            <td className='py-2 text-lg border-y border-slate-400'>{category}</td>
            <td className='py-2 text-lg border-y border-slate-400'>
                <div className='gap-2 flex items-center justify-center'>
                    <button className='' onClick={(e) => navigate(`/admin/edit/${id}`)}>
                        {/* Icono de lapiz de react-icons/md */}
                        <RiPencilLine size={25} />
                    </button>
                    <button className='cursor-pointer hover:opacity-70' onClick={handleDlete}>
                        <MdOutlineDelete className='text-red-500' size={25} />
                    </button>
                </div>
            </td>
        </tr>
    )
}
