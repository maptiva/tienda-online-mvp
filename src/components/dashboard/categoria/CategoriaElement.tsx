import React from 'react'
import { Categoria } from '../../../interfaces/Categoria'
import { RiPencilLine } from 'react-icons/ri';
import { MdOutlineDelete } from 'react-icons/md';
import Swal from 'sweetalert2';
import { useCategory } from '../../../hooks';

interface Props {
    categoria: Categoria;
    isMobileView?: boolean;
};

export const CategoriaElement = ({ categoria, isMobileView = false }: Props) => {
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

    if (isMobileView) {
        return (
            <div className='flex gap-4 items-center justify-end'>
                <button
                    onClick={handleUpdate}
                    className="p-2.5 rounded-full bg-blue-50 text-blue-600 active:bg-blue-100 transition-colors shadow-sm border border-blue-100"
                >
                    <RiPencilLine size={20} />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2.5 rounded-full bg-red-50 text-red-500 active:bg-red-100 transition-colors shadow-sm border border-red-100"
                >
                    <MdOutlineDelete size={20} />
                </button>
            </div>
        )
    }

    return (
        <tr className='text-center border-b border-gray-200 hover:bg-gray-50 transition-colors'>
            <td className='py-3 text-lg font-mono text-gray-500'>{id}</td>
            <td className='py-3 text-lg font-medium text-gray-800 text-left px-4'>{name}</td>
            <td className='py-3'>
                <div className='flex gap-4 items-center justify-center'>
                    <button className='cursor-pointer text-gray-400 hover:text-blue-600 transition-all duration-300 outline-none' onClick={handleUpdate}>
                        <RiPencilLine size={22} />
                    </button>
                    <button className='cursor-pointer text-red-400 hover:text-red-600 transition-all duration-300 outline-none' onClick={handleDelete}>
                        <MdOutlineDelete size={22} />
                    </button>
                </div>
            </td>
        </tr>
    )
}
