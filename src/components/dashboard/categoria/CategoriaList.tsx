import React from 'react'
import { CategoriaElement } from './CategoriaElement'
import { Categoria } from '../../../interfaces/Categoria'

interface Props {
    categories: Categoria[]
}

const CategoriaList = ({ categories }: Props) => {
    return (
        <div className='mt-5 flex-1 flex flex-col overflow-hidden'>
            {/* Vista Desktop - Tabla */}
            <div className='hidden md:flex flex-col flex-1 overflow-x-auto border border-gray-200 rounded-lg'>
                <div className="overflow-y-auto flex-1">
                    <table className='w-full'>
                        <thead className='bg-gray-300 border-b border-gray-500 sticky top-0'>
                            <tr>
                                <th className="py-2 px-4 font-semibold text-center w-20">ID</th>
                                <th className="py-2 px-4 text-left font-semibold">Nombre de Categoría</th>
                                <th className="py-2 px-4 font-semibold w-32">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map(categoria => (
                                <CategoriaElement key={categoria.id} categoria={categoria} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden space-y-3 pb-20">
                {categories.map(categoria => (
                    <div key={categoria.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                    ID: {categoria.id}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 mt-1">{categoria.name}</h3>
                            </div>

                            {/* Acciones movidas a una fila dedicada o botones más grandes para touch */}
                            <CategoriaElement categoria={categoria} isMobileView={true} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CategoriaList