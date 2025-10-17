import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';

import { Loading } from '../components/dashboard/Loading';
import { ProductElement } from '../components/dashboard/ProductElement';

function AdminDashboard() {
    const navigate = useNavigate();
    const { products, loading, error } = useProducts();

    if (loading) return <Loading message='Productos' />;

    return (
        <div className='w-full border-collapse shadow-xl bg-white p-8 rounded-xl'>
            <div className='p-5'>
                <h2 className='text-3xl font-bold'>Panel de Administración</h2>
                <button className='bg-green-500 text-white p-2 cursor-pointer hover:opacity-80 mt-5 rounded-lg' onClick={() => navigate('/admin/new')}>Añadir Nuevo Producto</button>
            </div>
            <div className='overflow-y-scroll h-[440px]'>
                <table className='w-full overflow-y-scroll'>
                    <thead>
                        <tr className='bg-slate-200'>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <ProductElement key={product.id} product={product} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;