import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaInstagram, FaFacebook, FaStore } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

// Contenido estático "Acerca de Clicando"
const aboutClicandoContent = {
    title: 'Acerca de Clicando',
    nuestraMision: `Clicando nació con un objetivo claro: democratizar el comercio digital local.
Creemos que la tecnología no debería ser exclusiva de las grandes empresas. Por eso, desarrollamos una plataforma simple, potente y accesible para que cualquier comerciante, emprendedor o profesional pueda tener su propia tienda online, sin barreras técnicas y en tiempo récord.`,
    queOfrecemos: `Transformamos la forma en que vendes online, simplificando cada paso:
- Catálogo Digital Profesional: Tu vidriera online abierta 24/7.
- Pedidos por WhatsApp: Conectamos a tus clientes directamente con tu celular.
- Identidad Propia: Tu marca, tu estilo.
- Mapa Interactivo: Te integramos en nuestro mapa de comercios locales.
- Autogestión Total: Panel de Administración simple para manejar stock y precios.`,
    porQueElegirnos: `Somos Accesibles: Pensado para la realidad del emprendedor local.
Somos Rápidos: Tu tienda queda lista para vender en el día.
Somos Locales: Entendemos tu mercado porque somos parte de él.`,
    futuro: `Trabajamos constantemente para darte más herramientas: Cupones, Métricas, Integración de pagos.`,
    desarrollado: `Desarrollado con ❤️ y tecnología por Maptiva.`
};

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeName: string;
    storeAboutText?: string | null;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, storeName, storeAboutText }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'tienda' | 'clicando'>('tienda');

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const renderContent = (content?: string | null) => {
        if (!content) return null;
        return content.split('\n').map((line, index) => {
            if (line.trim() === '') return <br key={index} />;
            return (
                <p key={index} className="mb-3 leading-relaxed">
                    {line}
                </p>
            );
        });
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-slate-800'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header con tabs */}
                <div className={`flex items-center justify-between p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-slate-700'
                    }`}>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('tienda')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'tienda'
                                ? 'shadow-md'
                                : 'opacity-60 hover:opacity-100'
                                }`}
                            style={{
                                backgroundColor: activeTab === 'tienda' ? 'var(--color-primary)' : 'transparent',
                                color: activeTab === 'tienda' ? 'var(--color-primary-text)' : 'var(--color-text-main)'
                            }}
                        >
                            <FaStore size={16} />
                            Nosotros
                        </button>
                        <button
                            onClick={() => setActiveTab('clicando')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'clicando'
                                ? 'shadow-md'
                                : 'opacity-60 hover:opacity-100'
                                }`}
                            style={{
                                backgroundColor: activeTab === 'clicando' ? 'var(--color-primary)' : 'transparent',
                                color: activeTab === 'clicando' ? 'var(--color-primary-text)' : 'var(--color-text-main)'
                            }}
                        >
                            Clicando
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-slate-700'
                            }`}
                        aria-label="Cerrar"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'tienda' ? (
                        <div>
                            <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
                                {storeName}
                            </h2>
                            {storeAboutText ? (
                                <div className={`prose max-w-none ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                    {renderContent(storeAboutText)}
                                </div>
                            ) : (
                                <p className={`italic ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Esta tienda aún no ha agregado información sobre su negocio.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
                                {aboutClicandoContent.title}
                            </h2>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Nuestra Misión</h3>
                                <div className="opacity-80">{renderContent(aboutClicandoContent.nuestraMision)}</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">¿Qué ofrecemos?</h3>
                                <div className="opacity-80">{renderContent(aboutClicandoContent.queOfrecemos)}</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">¿Por qué elegirnos?</h3>
                                <div className="opacity-80">{renderContent(aboutClicandoContent.porQueElegirnos)}</div>
                            </div>
                            <div className="pt-4 border-t opacity-70 italic text-sm">
                                {aboutClicandoContent.desarrollado}
                            </div>
                            <div className="flex gap-4 mt-3">
                                <a href="https://instagram.com/clicando.ar" target="_blank" rel="noopener noreferrer" className="hover:opacity-70"><FaInstagram size={20} /></a>
                                <a href="https://facebook.com/clicando.ar" target="_blank" rel="noopener noreferrer" className="hover:opacity-70"><FaFacebook size={20} /></a>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`p-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-slate-700'}`}>
                    <button
                        onClick={onClose}
                        className="w-full font-semibold py-3 px-6 rounded-lg transition-colors"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-primary-text)'
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
