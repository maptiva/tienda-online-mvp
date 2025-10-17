import React from 'react'
import { Categoria } from '../../../interfaces/Categoria'
import { BiPencil } from 'react-icons/bi';
import { MdDeleteOutline } from 'react-icons/md';

interface Props {
    categoria: Categoria
}

export const CategoriaElement = ({ categoria }: Props) => {
    const { id, nombre } = categoria;
    return (
        <tr className='text-center text-2xl border border-gray-300 rounded-lg'>
            <td className='py-2'>{id}</td>
            <td className='py-2'>{nombre}</td>
            <td className='py-2'>
                <div className='flex gap-5 items-center justify-center'>
                    <BiPencil className='text-gray-500 hover:bg-gray-400 hover:text-black cursor-pointer rounded-lg transition-all duration-300' />
                    <MdDeleteOutline className='text-red-500 hover:bg-red-400 cursor-pointer rounded-lg transition-all duration-300' />
                </div>
            </td>
        </tr>
    )
}
