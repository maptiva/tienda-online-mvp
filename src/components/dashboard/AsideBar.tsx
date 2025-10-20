import React from 'react'
import { BiLogOut } from 'react-icons/bi'
import { MdShoppingCart } from 'react-icons/md'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const AsideBar = () => {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Optionally, show an error message to the user
        }
    };

    return (
        <aside className='px-5 flex flex-col mt-5'>
            <h3 className='text-2xl font-bold mb-2 border-b'>Menu</h3>

            <nav className='flex flex-col flex-1 gap-3'>
                <NavLink to={'/admin/categoria'} className={({ isActive }) => `flex ${isActive ? 'bg-slate-400 text-white rounded-lg px-5 py-1' : ''}`}>
                    <span role="img" aria-label="categories" style={{ marginRight: '8px' }}>🗂️</span>
                    Categorías
                </NavLink>
                <NavLink to={'/admin/producto'} className={({ isActive }) => `flex ${isActive ? 'bg-slate-400 text-white rounded-lg px-5 py-1' : ''}`}>
                    <span role="img" aria-label="box" style={{ marginRight: '8px' }}>📦</span>
                    Productos
                </NavLink>

                <div className='mt-auto mb-2'>
                    <button onClick={handleLogout} className="flex items-center gap-2 mt-10 text-red-600 w-full text-left">
                        <BiLogOut />
                        Cerrar Sesión
                    </button>
                </div>

            </nav>
        </aside>
    )
}
