import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import LegalModal from './LegalModal'
import { legalTexts, footerDisclaimer } from '../constants/legalTexts'
import { CiLocationOn } from 'react-icons/ci'
import { PiPhone } from 'react-icons/pi'
import { BsClock } from 'react-icons/bs'
import { FaInstagram, FaFacebook } from 'react-icons/fa'

interface FooterProps {
    storeName?: string;
    storeData?: {
        address?: string;
        contact_phone?: string;
        business_hours?: string;
        instagram_url?: string;
        facebook_url?: string;
    };
}

const Footer: React.FC<FooterProps> = ({ storeName, storeData }) => {
    const displayName = storeName || 'Tienda Online';
    const { theme } = useTheme();
    const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

    const openModal = (type: 'terms' | 'privacy' | 'legal') => {
        setModalContent(legalTexts[type]);
    };

    const closeModal = () => {
        setModalContent(null);
    };

    // Datos de la tienda con fallbacks
    const displayAddress = storeData?.address || 'Dirección no disponible';
    const displayPhone = storeData?.contact_phone || 'Teléfono no disponible';
    const displayHours = storeData?.business_hours || 'Lun-Sab: 9:00 - 20:00';
    const displayInstagram = storeData?.instagram_url;
    const displayFacebook = storeData?.facebook_url;

    return (
        <>
            <footer className={`py-8 mt-auto transition-colors duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-slate-800'}`}>
                <div className='container mx-auto px-4'>

                    {/* Sección Principal: 2 columnas en desktop, stack en móvil */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-6'>

                        {/* Columna Izquierda: Información de Contacto */}
                        <div>
                            <h3 className='text-white font-bold text-lg mb-4'>
                                INFORMACIÓN DE TIENDA
                            </h3>
                            <div className='space-y-3 text-white'>
                                <div className='flex items-start gap-2'>
                                    <CiLocationOn size={20} className='flex-shrink-0 mt-1' color='#ff6900' />
                                    <p className='text-sm'>{displayAddress}</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <PiPhone size={20} className='flex-shrink-0' color='#ff6900' />
                                    <p className='text-sm'>{displayPhone}</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <BsClock size={20} className='flex-shrink-0' color='#ff6900' />
                                    <p className='text-sm'>{displayHours}</p>
                                </div>
                            </div>

                            {/* Redes Sociales */}
                            {(displayInstagram || displayFacebook) && (
                                <div className='flex gap-4 mt-4'>
                                    {displayInstagram && (
                                        <a
                                            href={displayInstagram}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='cursor-pointer'
                                        >
                                            <FaInstagram
                                                size={25}
                                                className='text-white hover:text-[#ff6900] transition-all duration-300'
                                            />
                                        </a>
                                    )}
                                    {displayFacebook && (
                                        <a
                                            href={displayFacebook}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='cursor-pointer'
                                        >
                                            <FaFacebook
                                                size={25}
                                                className='text-white hover:text-[#ff6900] transition-all duration-300'
                                            />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Columna Derecha: Acerca de Clicando */}
                        <div className='md:text-right'>
                            <h3 className='text-white font-bold text-lg mb-4'>
                                ACERCA DE CLICANDO.COM.AR
                            </h3>
                            <p className='text-white text-sm mb-3'>
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

                            {/* Links Legales */}
                            <div className='flex flex-wrap gap-2 text-white/80 text-sm mb-4 md:justify-end'>
                                <button
                                    onClick={() => openModal('terms')}
                                    className='hover:text-orange-500 hover:underline transition-colors'
                                >
                                    Términos
                                </button>
                                <span>|</span>
                                <button
                                    onClick={() => openModal('privacy')}
                                    className='hover:text-orange-500 hover:underline transition-colors'
                                >
                                    Privacidad
                                </button>
                                <span>|</span>
                                <button
                                    onClick={() => openModal('legal')}
                                    className='hover:text-orange-500 hover:underline transition-colors'
                                >
                                    Aviso Legal
                                </button>
                            </div>

                            {/* Botón Tiendas Clicando */}
                            <div className='inline-block'>
                                <button
                                    disabled
                                    className='bg-orange-500 text-white font-bold py-2 px-4 rounded-lg text-sm opacity-70 cursor-not-allowed'
                                >
                                    Ver Tiendas Clicando
                                </button>
                                <p className='text-white/60 text-sm mt-1 italic'>Próximamente</p>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer y Copyright */}
                    <div className='border-t border-white/20 pt-4 text-center'>
                        <p className='text-white/90 text-sm mb-2'>
                            {footerDisclaimer}
                        </p>
                        <p className='text-white/90 text-sm'>
                            © 2025 {displayName}. Todos los derechos reservados
                        </p>
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