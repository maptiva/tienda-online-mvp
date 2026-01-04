import React from 'react'
import { BiLogOut } from 'react-icons/bi'
import { MdShoppingCart } from 'react-icons/md'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isSuperAdmin } from '../../utils/authRoles'

export const AsideBar = () => {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const isMaster = isSuperAdmin(user);

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
                <NavLink to={'/admin/precios'} className={({ isActive }) => `flex ${isActive ? 'bg-slate-400 text-white rounded-lg px-5 py-1' : ''}`}>
                    <span role="img" aria-label="money" style={{ marginRight: '8px' }}>💰</span>
                    Actualización Masiva
                </NavLink>
                <NavLink to={'/admin/settings'} className={({ isActive }) => `flex ${isActive ? 'bg-slate-400 text-white rounded-lg px-5 py-1' : ''}`}>
                    <span role="img" aria-label="settings" style={{ marginRight: '8px' }}>⚙️</span>
                    Configuración
                </NavLink>

                {/* Súper Admin Portal (Visible solo para Alejandro) */}
                {isMaster && (
                    <div className="mt-8 pt-4 border-t border-gray-200 animate-fade-in">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-3 px-2 tracking-widest">
                            👑 Portal Maestro
                        </p>
                        <div className="flex flex-col gap-2">
                            <NavLink
                                to={'/admin/crm'}
                                end
                                className={({ isActive }) => `flex items-center gap-2 p-2 rounded-lg transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                            >
                                <span className="text-lg">📊</span>
                                <span className="text-sm font-medium">Dashboard CRM</span>
                            </NavLink>
                            <NavLink
                                to={'/admin/crm/clients'}
                                className={({ isActive }) => `flex items-center gap-2 p-2 rounded-lg transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                            >
                                <span className="text-lg">👥</span>
                                <span className="text-sm font-medium">Gestión Clientes</span>
                            </NavLink>
                            <NavLink
                                to={'/admin/crm/payments'}
                                className={({ isActive }) => `flex items-center gap-2 p-2 rounded-lg transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                            >
                                <span className="text-lg">💰</span>
                                <span className="text-sm font-medium">Pagos</span>
                            </NavLink>
                        </div>
                    </div>
                )}


                <div className='mt-auto mb-2'>
                    <button onClick={handleLogout} className="flex items-center gap-2 mt-10 text-red-600 w-full text-left cursor-pointer">
                        <BiLogOut />
                        Cerrar Sesión
                    </button>
                </div>

            </nav>
        </aside>
    )
}
