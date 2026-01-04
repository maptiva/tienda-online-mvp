import React from 'react'
import { Categoria } from '../../../interfaces/Categoria'
import { BiPencil } from 'react-icons/bi';
import { MdDeleteOutline } from 'react-icons/md';
import Swal from 'sweetalert2';
import { useCategory } from '../../../hooks';

interface Props {
    categoria: Categoria
};

export const CategoriaElement = ({ categoria }: Props) => {
    const { id, name } = categoria;
    const { startDeleteCategory, startUpdateCategory } = useCategory();

    const handleUpdate = async () => {
        const { isConfirmed, value } = await Swal.fire({
            title: `Modificar Categoria ${name}`,
            text: 'Nuevo Valor',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Aceptar'
        });

        if (isConfirmed) {
            startUpdateCategory({ id: id, name: value })
        }
    }

    const handleDelete = async () => {
        const { isConfirmed } = await Swal.fire({
            title: `Seguro quiere eliminar la Categoria ${name}`,
            showCancelButton: true,
            confirmButtonText: 'Aceptar'
        });

        if (isConfirmed) {
            startDeleteCategory(id);
        }
    };

    return (
        <tr className='text-center border-b border-gray-200 hover:bg-gray-50 transition-colors'>
            <td className='py-3 text-lg'>{id}</td>
            <td className='py-3 text-lg font-medium text-gray-800'>{name}</td>
            <td className='py-3'>
                <div className='flex gap-5 items-center justify-center'>
                    <BiPencil size={22} onClick={handleUpdate} className='text-gray-500 cursor-pointer hover:text-blue-600 transition-all duration-300' />
                    <MdDeleteOutline size={22} onClick={handleDelete} className='text-red-500 cursor-pointer hover:text-red-600 transition-all duration-300' />
                </div>
            </td>
        </tr>
    )
}
