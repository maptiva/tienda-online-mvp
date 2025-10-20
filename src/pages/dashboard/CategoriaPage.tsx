import React, { useEffect } from 'react'
import CategoriaList from '../../components/dashboard/categoria/CategoriaList'
import { useCategories } from '../../hooks/categoria/useCategories'
import Swal from 'sweetalert2';
import { useCategory } from '../../hooks';

const CategoriaPage = () => {

    const { startAddCategory } = useCategory();
    const { categories, startGetCategories } = useCategory()

    useEffect(() => {
        startGetCategories();
    }, [])

    const handleAddCategory = async () => {
        const { isConfirmed, value } = await Swal.fire({
            title: 'Agregar Categoria',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Aceptar'
        });

        if (isConfirmed) {
            startAddCategory({ name: value[0].toUpperCase() + value.slice(1) })
        }
    }

    return (
        <div className="w-full border-collapse shadow-xl bg-white p-8 rounded-xl">
            <h1 className='text-3xl border-b border-gray-300 pb-3 mb-3 font-bold'>Panel de Administracion</h1>

            <div onClick={handleAddCategory}>
                <button className='text-white rounded-lg bg-green-500 mt-5 hover:opacity-80 cursor-pointer p-2'>Agregar Categoria</button>
            </div>

            <CategoriaList categories={categories} />
        </div>
    )
}

export default CategoriaPage