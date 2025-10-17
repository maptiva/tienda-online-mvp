import React from 'react'
import CategoriaList from '../../components/dashboard/categoria/CategoriaList'

const CategoriaPage = () => {
    return (
        <div className="w-full border-collapse shadow-xl bg-white p-8 rounded-xl">
            <h1 className='text-3xl border-b border-gray-300 pb-3 mb-3 font-bold'>Panel de Administracion</h1>

            <div>
                <button className='text-white rounded-lg bg-green-500 mt-5 hover:opacity-80 cursor-pointer p-2'>Agregar Categoria</button>
            </div>

            <CategoriaList />
        </div>
    )
}

export default CategoriaPage