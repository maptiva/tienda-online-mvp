import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { Product } from '../../interfaces/Producto'
import { Loading } from '../../components/dashboard/Loading'
import { ProductElement } from '../../components/dashboard/ProductElement'

export const ProductPage = () => {
    const navigate = useNavigate();

    const { products, loading, error } = useProducts();

    if (loading) return <Loading message='Productos' />

    return (
        <div className='w-full border-collapse px-5 mt-5 shadow-xl bg-white'>
            <h2 className='text-3xl font-bold'>Panel de Administración</h2>
            <button className='bg-green-500 text-white p-2 cursor-pointer hover:opacity-80 mb-5 rounded-lg' onClick={() => navigate('/admin/new')}>Añadir Nuevo Producto</button>
            <div className='overflow-y-scroll h-90'>
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
                        {products.map((product: Product) => (
                            <ProductElement key={product.id} product={product} />
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}
