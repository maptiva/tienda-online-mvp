import React, { useEffect, useState, useMemo } from 'react'
import CategoriaList from '../../components/dashboard/categoria/CategoriaList'
import { useCategories } from '../../hooks/categoria/useCategories'
import Swal from 'sweetalert2';
import { useCategory } from '../../hooks';
import SearchBar from '../../components/SearchBar';

const CategoriaPage = () => {

    const { startAddCategory } = useCategory();
    const { categories, startGetCategories } = useCategory()
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        startGetCategories();
    }, [])

    // Filtrar categorías por búsqueda
    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        if (!searchTerm) return categories;

        const searchLower = searchTerm.toLowerCase();
        return categories.filter((category) => {
            const matchesName = category.name.toLowerCase().includes(searchLower);
            const matchesId = category.id.toString().includes(searchTerm);
            return matchesName || matchesId;
        });
    }, [categories, searchTerm]);

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

            {/* Buscador */}
            <div className='mt-5 mb-3'>
                <SearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeholder="Buscar categorías por nombre o ID..."
                />
            </div>

            <div onClick={handleAddCategory}>
                <button className='text-white rounded-lg bg-green-500 mt-3 hover:opacity-80 cursor-pointer p-2'>Agregar Categoria</button>
            </div>

            {/* Contador de resultados */}
            {categories && (
                <p className='text-sm text-gray-600 mt-2 mb-3'>
                    Mostrando {filteredCategories.length} de {categories.length} categorías
                </p>
            )}

            <CategoriaList categories={filteredCategories} />
        </div>
    )
}

export default CategoriaPage