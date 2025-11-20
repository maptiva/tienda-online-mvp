import React from 'react'

interface FooterProps {
    storeName?: string;
}

const Footer: React.FC<FooterProps> = ({ storeName }) => {
    const displayName = storeName || 'Tienda Online';

    return (
        <footer className='bg-slate-800 text-white py-6 mt-auto'>
            <div className='container mx-auto px-4'>
                <div className='flex flex-col md:flex-row items-center justify-between gap-4 text-sm'>

                    <p className='text-slate-300 text-center md:text-left'>
                        © 2025 {displayName}. Todos los derechos reservados
                    </p>
                    <p className='text-slate-400 text-center md:text-right'>
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