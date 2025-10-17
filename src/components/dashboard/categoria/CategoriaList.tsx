import React from 'react'
import { CategoriaElement } from './CategoriaElement'

const categorias = [
    {
        nombre: "categoria 1",
        id: 1
    },
    {
        nombre: "categoria 2",
        id: 2
    }
]

const CategoriaList = () => {
    return (
        <div className='mt-5 overflow-y-scroll h-[440px]'>
            <table className='w-full'>
                <thead className='bg-gray-300 border-b border-gray-500'>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.map(categoria => (
                        <CategoriaElement key={categoria.id} categoria={categoria} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default CategoriaList