import React from 'react'
import { BiLogOut } from 'react-icons/bi'
import { MdShoppingCart } from 'react-icons/md'
import { NavLink } from 'react-router-dom'

export const AsideBar = () => {
    return (
        <aside className='px-5 flex flex-col mt-5'>
            <h3 className='text-2xl font-bold mb-2 border-b'>Menu</h3>

            <nav className='flex flex-col flex-1 gap-3'>
                <NavLink to={'/admin'} className={({ isActive }) => `flex ${isActive ? 'bg-slate-400 text-white rounded-lg px-5 py-1' : ''}`}>
                    <span role="img" aria-label="box" style={{ marginRight: '8px' }}>📦</span>
                    Productos
                </NavLink>
                <NavLink to={'/admin/categoria'}>
                    <span role="img" aria-label="categories" style={{ marginRight: '8px' }}>🗂️</span>
                    Categorías
                </NavLink>

                <div className='mt-auto mb-2'>
                    <NavLink to="/logout" className="flex items-center gap-2 mt-10 text-red-600">
                        <BiLogOut />
                        Cerrar Sesión
                    </NavLink>
                </div>

            </nav>
        </aside>
    )
}
