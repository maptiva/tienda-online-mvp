import React from 'react'
import { useTheme } from '../context/ThemeContext'


const Footer = ({ storeName }) => {
    const displayName = storeName || 'Tienda Online';
    const { theme } = useTheme();

    return (
        <footer className={`py-6 mt-auto transition-colors duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-slate-800'}`}>
            <div className='container mx-auto px-4'>
                <div className='flex flex-col md:flex-row items-center justify-between gap-4 text-sm'>

                    <p className='text-white text-center md:text-left transition-colors duration-300'>
                        © 2025 {displayName}. Todos los derechos reservados
                    </p>
                    <p className='text-white text-center md:text-right transition-colors duration-300'>
                        Desarrollado por{' '}
                        <a
                            href='https://maptiva.github.io/maptiva/'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-orange-500 font-semibold hover:underline'
                        >
                            Maptiva
                        </a>
                    </p>

                </div>
            </div>
        </footer>
    )
}

export default Footer