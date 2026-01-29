import React from 'react'
import { BiLogOut } from 'react-icons/bi'
import { MdShoppingCart } from 'react-icons/md'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isSuperAdmin } from '../../utils/authRoles'

interface AsideBarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const AsideBar: React.FC<AsideBarProps> = ({ isOpen = true, onClose }) => {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const location = useLocation();
    const isMaster = isSuperAdmin(user);

    // Helper para detectar si estamos en la sección de productos (incluyendo edición/creación)
    const isProductSection = location.pathname.startsWith('/admin/producto') ||
        location.pathname.startsWith('/admin/edit') ||
        location.pathname.startsWith('/admin/new') ||
        location.pathname === '/admin';

    const activeClass = "bg-[#5FAFB8] text-[#1e293b] shadow-md font-bold";
    const inactiveClass = "text-gray-600 hover:bg-slate-100 hover:text-slate-700 font-medium";
    const commonClass = "flex items-center gap-3 p-2 rounded-lg transition-all group";

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const handleNavClick = () => {
        // Cerrar el menú móvil al hacer clic en un enlace
        if (onClose) {
            onClose();
        }
    };

    return (
        <aside className={`
            fixed top-0 left-0 h-full bg-white shadow-xl z-[999]
            transition-transform duration-300 ease-in-out
            w-[280px] px-5 flex flex-col pb-5
            lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:w-[280px]
            lg:rounded-2xl lg:shadow-lg lg:border lg:border-gray-200 lg:p-8
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            <h3 className='text-2xl font-bold mb-2 border-b pb-2'>Menu</h3>

            <nav className='flex flex-col flex-1 gap-1 overflow-y-auto'>
                <NavLink
                    to={'/admin/categoria'}
                    onClick={handleNavClick}
                    className={({ isActive }) => `${commonClass} ${isActive ? activeClass : inactiveClass}`}
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">🗂️</span>
                    <span>Categorías</span>
                </NavLink>

                <NavLink
                    to={'/admin/producto'}
                    onClick={handleNavClick}
                    className={`${commonClass} ${isProductSection ? activeClass : inactiveClass}`}
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">📦</span>
                    <span>Productos</span>
                </NavLink>

                <NavLink
                    to={'/admin/inventario'}
                    onClick={handleNavClick}
                    className={({ isActive }) => `${commonClass} ${isActive ? activeClass : inactiveClass}`}
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
                    <span>Inventario</span>
                </NavLink>

                <NavLink
                    to={'/admin/precios'}
                    onClick={handleNavClick}
                    className={({ isActive }) => `${commonClass} ${isActive ? activeClass : inactiveClass}`}
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">💰</span>
                    <span>Actualización Masiva</span>
                </NavLink>

                <NavLink
                    to={'/admin/settings'}
                    onClick={handleNavClick}
                    className={({ isActive }) => `${commonClass} ${isActive ? activeClass : inactiveClass}`}
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">⚙️</span>
                    <span>Configuración</span>
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
                                onClick={handleNavClick}
                                className={({ isActive }) => `${commonClass} ${isActive ? activeClass : inactiveClass}`}
                            >
                                <span className="text-xl">📊</span>
                                <span className="text-sm">Dashboard CRM</span>
                            </NavLink>
                            <NavLink
                                to={'/admin/crm/clients'}
                                onClick={handleNavClick}
                                className={({ isActive }) => `${commonClass} ${isActive ? activeClass : inactiveClass}`}
                            >
                                <span className="text-xl">👥</span>
                                <span className="text-sm">Gestión Clientes</span>
                            </NavLink>
                            <NavLink
                                to={'/admin/crm/payments'}
                                onClick={handleNavClick}
                                className={({ isActive }) => `${commonClass} ${isActive ? activeClass : inactiveClass}`}
                            >
                                <span className="text-xl">💰</span>
                                <span className="text-sm">Pagos</span>
                            </NavLink>
                        </div>
                    </div>
                )}


                <div className='mt-auto mb-2'>
                    <button onClick={handleLogout} className="flex items-center gap-2 mt-10 text-red-600 w-full text-left cursor-pointer hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <BiLogOut />
                        Cerrar Sesión
                    </button>
                </div>

            </nav>
        </aside>
    )
}
