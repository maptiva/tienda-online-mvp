import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import LegalModal from './LegalModal'
import { legalTexts, footerDisclaimer } from '../constants/legalTexts'

interface FooterProps {
    storeName?: string;
}

const Footer: React.FC<FooterProps> = ({ storeName }) => {
    const displayName = storeName || 'Tienda Online';
    const { theme } = useTheme();
    const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

    const openModal = (type: 'terms' | 'privacy' | 'legal') => {
        setModalContent(legalTexts[type]);
    };

    const closeModal = () => {
        setModalContent(null);
    };

    return (
        <>
            <footer className={`py-6 mt-auto transition-colors duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-slate-800'}`}>
                <div className='container mx-auto px-4'>
                    <div className='flex flex-col items-center gap-4 text-sm'>

                        {/* Copyright y Maptiva */}
                        <div className='flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center'>
                            <p className='text-white transition-colors duration-300'>
                                © 2025 {displayName}. Todos los derechos reservados
                            </p>
                            <span className='hidden md:inline text-white'>•</span>
                            <p className='text-white transition-colors duration-300'>
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

                        {/* Disclaimer */}
                        <p className='text-white/90 text-center max-w-2xl leading-relaxed'>
                            {footerDisclaimer}
                        </p>

                        {/* Links legales */}
                        <div className='flex flex-wrap items-center justify-center gap-3 text-white/80'>
                            <button
                                onClick={() => openModal('terms')}
                                className='hover:text-orange-500 hover:underline transition-colors'
                            >
                                Términos del Servicio
                            </button>
                            <span>|</span>
                            <button
                                onClick={() => openModal('privacy')}
                                className='hover:text-orange-500 hover:underline transition-colors'
                            >
                                Política de Privacidad
                            </button>
                            <span>|</span>
                            <button
                                onClick={() => openModal('legal')}
                                className='hover:text-orange-500 hover:underline transition-colors'
                            >
                                Aviso Legal
                            </button>
                        </div>

                    </div>
                </div>
            </footer>

            {/* Modal */}
            {modalContent && (
                <LegalModal
                    isOpen={!!modalContent}
                    onClose={closeModal}
                    title={modalContent.title}
                    content={modalContent.content}
                />
            )}
        </>
    )
}

export default Footer