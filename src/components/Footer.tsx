import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import LegalModal from './LegalModal'
import { legalTexts, footerDisclaimer } from '../constants/legalTexts'
import { IoLocation } from 'react-icons/io5' // Filled icon
import { IoCall } from 'react-icons/io5' // Filled icon
import { IoTime } from 'react-icons/io5' // Filled icon
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
            <footer
                className="py-8 mt-auto transition-colors duration-300"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    borderTop: `1px solid var(--color-border)`
                }}
            >
                <div className='container mx-auto px-4'>

                    {/* Sección Principal: 2 columnas en desktop, stack en móvil */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-6'>

                        {/* Columna Izquierda: Información de Tienda */}
                        <div>
                            <h3
                                className='font-bold text-lg mb-4'
                                style={{ color: 'var(--color-text-main)' }}
                            >
                                INFORMACIÓN DE TIENDA
                            </h3>
                            <div className='space-y-3' style={{ color: 'var(--color-text-main)' }}>
                                <div className='flex items-start gap-2'>
                                    <IoLocation size={20} className='flex-shrink-0 mt-1' style={{ color: 'var(--color-primary)' }} />
                                    <p className='text-sm'>{displayAddress}</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <IoCall size={20} className='flex-shrink-0' style={{ color: 'var(--color-primary)' }} />
                                    <p className='text-sm'>{displayPhone}</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <IoTime size={20} className='flex-shrink-0' style={{ color: 'var(--color-primary)' }} />
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
                                            className='transition-opacity hover:opacity-70'
                                            style={{ color: 'var(--color-primary)' }}
                                        >
                                            <FaInstagram size={24} />
                                        </a>
                                    )}
                                    {displayFacebook && (
                                        <a
                                            href={displayFacebook}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='transition-opacity hover:opacity-70'
                                            style={{ color: 'var(--color-primary)' }}
                                        >
                                            <FaFacebook size={24} />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Columna Derecha: Acerca de Clicando */}
                        <div className='md:text-right'>
                            <h3
                                className='font-bold text-lg mb-4'
                                style={{ color: 'var(--color-text-main)' }}
                            >
                                ACERCA DE CLICANDO.COM.AR
                            </h3>
                            <p className='text-sm mb-3' style={{ color: 'var(--color-text-main)' }}>
                                Desarrollado por{' '}
                                <a
                                    href='https://maptiva.github.io/maptiva/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='font-semibold hover:underline transition-colors'
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    Maptiva
                                </a>
                            </p>

                            {/* Links Legales */}
                            <div className='flex flex-wrap gap-2 text-sm mb-4 md:justify-end' style={{ color: 'var(--color-text-light)' }}>
                                <button
                                    onClick={() => openModal('terms')}
                                    className='hover:underline transition-colors'
                                    style={{ color: 'var(--color-text-light)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
                                >
                                    Términos
                                </button>
                                <span>|</span>
                                <button
                                    onClick={() => openModal('privacy')}
                                    className='hover:underline transition-colors'
                                    style={{ color: 'var(--color-text-light)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
                                >
                                    Privacidad
                                </button>
                                <span>|</span>
                                <button
                                    onClick={() => openModal('legal')}
                                    className='hover:underline transition-colors'
                                    style={{ color: 'var(--color-text-light)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
                                >
                                    Aviso Legal
                                </button>
                            </div>

                            {/* Botón Tiendas Clicando */}
                            <div className='inline-block'>
                                <button
                                    disabled
                                    className='font-bold py-2 px-4 rounded-lg text-sm opacity-70 cursor-not-allowed'
                                    style={{
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'var(--color-primary-text)'
                                    }}
                                >
                                    Ver Tiendas Clicando
                                </button>
                                <p className='text-sm mt-1 italic' style={{ color: 'var(--color-text-light)', opacity: 0.6 }}>
                                    Próximamente
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer y Copyright */}
                    <div className='text-center pt-6' style={{ borderTop: `1px solid var(--color-border)` }}>
                        <p className='text-sm mb-2' style={{ color: 'var(--color-text-light)', opacity: 0.9 }}>
                            {footerDisclaimer}
                        </p>
                        <p className='text-sm' style={{ color: 'var(--color-text-light)', opacity: 0.9 }}>
                            © 2025 {displayName}. Todos los derechos reservados
                        </p>
                    </div>
                </div>
            </footer>

            {/* Modal Legal */}
            {modalContent && (
                <LegalModal
                    isOpen={!!modalContent}
                    title={modalContent.title}
                    content={modalContent.content}
                    onClose={closeModal}
                />
            )}
        </>
    );
};

export default Footer;