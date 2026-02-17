import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';

import { Loading } from '../components/dashboard/Loading';
import { ProductElement } from '../components/dashboard/ProductElement';
import { ProductCard } from '../components/dashboard/ProductCard';
import SearchBar from '../components/SearchBar';

function AdminDashboard() {
    const navigate = useNavigate();
    const { products, loading, error } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar productos por búsqueda
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        if (!searchTerm) return products;

        const searchLower = searchTerm.toLowerCase();
        return products.filter((product) => {
            const searchLower = searchTerm.toLowerCase();
            const matchesName = product.name.toLowerCase().includes(searchLower);
            const matchesCategory = product.categories?.name?.toLowerCase().includes(searchLower) || false;

            // Búsqueda por SKU o ID Local (display_id)
            const matchesSKU = product.sku?.toLowerCase().includes(searchLower) || false;

            // Lógica para ID: Si tiene display_id usamos ese, si no el global (fallback)
            const idToSearch = product.display_id || product.id;

            const matchesID = searchLower.startsWith('#')
                ? idToSearch.toString() === searchLower.replace('#', '')
                : idToSearch.toString().includes(searchLower);

            return matchesName || matchesCategory || matchesSKU || matchesID;
        });
    }, [products, searchTerm]);

    if (loading) return <Loading message='Productos' />;

    return (
        <div className='w-full border-collapse shadow-xl bg-white p-4 md:p-8 rounded-xl flex flex-col flex-1 min-h-0'>
            <h1 className='text-2xl md:text-3xl border-b border-gray-300 pb-3 mb-3 font-bold'>Panel de Administración</h1>

            {/* Buscador */}
            <div className='mt-5 mb-3'>
                <SearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeholder="Buscar productos por nombre, categoría o ID..."
                />
            </div>

            <div className='flex flex-col md:flex-row md:items-center justify-between gap-3 mt-3'>
                <button
                    className='bg-green-500 text-white p-2 px-4 cursor-pointer hover:opacity-80 rounded-lg w-full md:w-auto font-medium transition-all active:scale-95'
                    onClick={() => navigate('/admin/new')}
                >
                    + Añadir Nuevo Producto
                </button>

                {/* Contador de resultados */}
                {products && (
                    <p className='text-sm text-gray-500 font-medium'>
                        Mostrando <span className='text-gray-800'>{filteredProducts.length}</span> de <span className='text-gray-800'>{products.length}</span> productos
                    </p>
                )}
            </div>

            {/* Vista Desktop - Tabla */}
            <div className='mt-4 overflow-hidden hidden md:flex flex-col flex-1 border border-gray-100 rounded-lg shadow-sm bg-white'>
                <div className='overflow-y-auto flex-1 custom-scrollbar'>
                    <table className='w-full border-separate border-spacing-0'>
                        <thead className='bg-gray-300 sticky top-0 z-[40] shadow-sm'>
                            <tr>
                                <th className="py-2 px-4">ID</th>
                                <th className="py-2 px-4 text-left">Imagen</th>
                                <th className="py-2 px-4 text-left">Nombre</th>
                                <th className="py-2 px-4 text-left">Precio</th>
                                <th className="py-2 px-4 text-left">Categoría</th>
                                <th className="py-2 px-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <ProductElement key={product.id} product={product} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className='text-center py-4 text-gray-500'>
                                        No se encontraron productos que coincidan con "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vista Mobile - Cards */}
            <div className='mt-5 md:hidden flex-1 min-h-0 flex flex-col'>
                <div className='flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3'>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className='text-center py-8 text-gray-500'>
                            No se encontraron productos que coincidan con "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;