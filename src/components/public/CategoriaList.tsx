import React, { useEffect } from 'react'
import { useCategory } from '../../hooks/categoria/useCategory'

const CategoriaList = () => {

    const { categories, startGetCategories, startActiveCategory, categoryActive, limpiarCategoryActive } = useCategory();

    useEffect(() => {
        startGetCategories();
    }, [])

    const activarCategoria = (id: number) => {
        if (id === 0) {
            return limpiarCategoryActive()
        }
        startActiveCategory(id);
    };

    return (
        <div className='flex ml-2 gap-2 overflow-x-scroll w-full'>
            <div
                onClick={(e) => activarCategoria(0)}
                key={0}
                className={`${!categoryActive ? 'bg-blue-300' : 'bg-white'} rounded-xl p-3 hover:cursor-pointer my-3 shadow hover:shadow-lg transition-shadow border border-slate-100`}
            >
                <h3 className="text-lg font-semibold text-slate-800 m-0">Todos</h3>
            </div>
            {
                categories.map(elem => (
                    <div
                        onClick={(e) => activarCategoria(elem.id)}
                        key={elem.id}
                        className={`${categoryActive?.id === elem.id ? 'bg-blue-300' : 'bg-white'} rounded-xl p-3 hover:cursor-pointer my-3 shadow hover:shadow-lg transition-shadow border border-slate-100`}
                    >
                        <h3 className="text-lg font-semibold text-slate-800 m-0">{elem.name}</h3>
                    </div>
                ))
            }
        </div>
    )
}

export default CategoriaList