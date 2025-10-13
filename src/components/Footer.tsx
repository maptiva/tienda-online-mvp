import React from 'react'

const Footer = () => {
    return (
        <footer className='bg-slate-800 text-white py-6 mt-auto'>
            <div className='container mx-auto px-4'>
                <div className='flex flex-col md:flex-row items-center justify-between gap-4 text-sm'>

                    <p className='text-slate-300 text-center md:text-left'>© 2025 Sport Store. Todos los derechos reservados</p>
                    <p className='text-slacte-400 text-center md:text-rigth'>Desarrollado por <span className='text-orange-500 font-semibold'>Tu Nombre</span></p>

                </div>
            </div>
        </footer>
    )
}

export default Footer