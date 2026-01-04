import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';

import { Loading } from '../components/dashboard/Loading';
import { ProductElement } from '../components/dashboard/ProductElement';
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
            const matchesName = product.name.toLowerCase().includes(searchLower);
            const matchesCategory = product.categories?.name?.toLowerCase().includes(searchLower) || false;
            const matchesId = product.id.toString().includes(searchTerm);

            return matchesName || matchesCategory || matchesId;
        });
    }, [products, searchTerm]);

    if (loading) return <Loading message='Productos' />;

    return (
        <div className='w-full border-collapse shadow-xl bg-white p-8 rounded-xl'>
            <h1 className='text-3xl border-b border-gray-300 pb-3 mb-3 font-bold'>Panel de Administración</h1>

            {/* Buscador */}
            <div className='mt-5 mb-3'>
                <SearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeholder="Buscar productos por nombre, categoría o ID..."
                />
            </div>

            <button className='bg-green-500 text-white p-2 cursor-pointer hover:opacity-80 mt-3 rounded-lg'
                onClick={() => navigate('/admin/new')}>
                Añadir Nuevo Producto
            </button>

            {/* Contador de resultados */}
            {products && (
                <p className='text-sm text-gray-600 mt-2 mb-3'>
                    Mostrando {filteredProducts.length} de {products.length} productos
                </p>
            )}

            <div className='mt-5 overflow-y-scroll h-[440px]'>
                <table className='w-full'>
                    <thead className='bg-gray-300 border-b border-gray-500'>
                        <tr>
                            <th className="py-2 px-4">ID</th>
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
                                <td colSpan={5} className='text-center py-4 text-gray-500'>
                                    No se encontraron productos que coincidan con "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;