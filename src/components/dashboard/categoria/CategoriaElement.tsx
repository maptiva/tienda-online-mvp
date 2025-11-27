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
        <tr className='text-center text-2xl border border-gray-300 rounded-lg'>
            <td className='py-2'>{id}</td>
            <td className='py-2'>{name}</td>
            <td className='py-2'>
                <div className='flex gap-5 items-center justify-center'>
                    <BiPencil onClick={handleUpdate} className='text-gray-500 cursor-pointer hover:opacity-70 transition-all duration-300' />
                    <MdDeleteOutline onClick={handleDelete} className='text-red-500 cursor-pointer hover:opacity-70 transition-all duration-300' />
                </div>
            </td>
        </tr>
    )
}
