import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaWhatsapp, FaCog, FaStore } from 'react-icons/fa';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import StoreDirectory from '../components/StoreDirectory';
import logoClicandoPng from '../assets/logo-clicando.png';
import catalogoIllustration from '../assets/illustrations/catalogo-completo.png';
import whatsappIllustration from '../assets/illustrations/whatsapp-integrado.png';
import personalizableIllustration from '../assets/illustrations/personalizable.png';
import SEO from '../components/shared/SEO';
import { motion } from 'framer-motion';
import StoreCard from '../components/StoreCard';

function LandingPage() {
    const { theme, toggleTheme } = useTheme();
    const [featuredStores, setFeaturedStores] = useState([]);
    const [showDirectory, setShowDirectory] = useState(false);
    const carouselRef = React.useRef(null);

    useEffect(() => {
        const fetchFeaturedStores = async () => {
            const { data, error } = await supabase
                .from('stores')
                .select('id, store_name, store_slug, logo_url, is_demo, coming_soon, is_active, created_at, category, short_description, is_open')
                .limit(20);

            if (error) {
                console.error("Error cargando tiendas destacadas:", error);
                return;
            }

            if (data) {
                // Custom sorting logic - Active stores first
                const getStoreRank = (store) => {
                    if (store.is_active && !store.is_demo && !store.coming_soon) {
                        return 1; // Active stores first
                    }
                    if (store.is_demo) {
                        return 2; // Demo second
                    }
                    if (store.coming_soon) {
                        return 3; // Coming soon third
                    }
                    return 4; // Others
                };

                const sortedData = (data || [])
                    .filter(s => s.is_active || s.coming_soon || s.is_demo)
                    .sort((a, b) => {
                        const rankA = getStoreRank(a);
                        const rankB = getStoreRank(b);

                        if (rankA !== rankB) {
                            return rankA - rankB;
                        }

                        // Secondary sort by creation date (newest first)
                        if (a.created_at && b.created_at) {
                            return new Date(b.created_at) - new Date(a.created_at);
                        }
                        return 0;
                    });

                setFeaturedStores(sortedData.slice(0, 20));
            }
        };
        fetchFeaturedStores();
    }, []);

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "name": "Clicando",
                "url": "https://clicando.com.ar"
            },
            {
                "@type": "SiteNavigationElement",
                "hasPart": [
                    {
                        "@type": "WebPage",
                        "name": "Acceso Clientes",
                        "description": "Ingresa a tu panel de administración para gestionar tu tienda.",
                        "url": "https://clicando.com.ar/login"
                    },
                    {
                        "@type": "WebPage",
                        "name": "Mapa de Tiendas",
                        "description": "Explora los comercios cercanos en nuestro mapa interactivo.",
                        "url": "https://clicando.com.ar/mapa"
                    }
                ]
            }
        ]
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 py-12 transition-colors duration-500 relative overflow-x-hidden"
            style={{
                background: theme === 'dark'
                    ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
                    : 'linear-gradient(135deg, #C9B8A8 0%, #E8E2DB 50%, #C9B8A8 100%)'
            }}
        >
            <SEO
                title="Clicando - Tu Tienda Online Simple y Rápida"
                description="Crea tu tienda online en minutos con Clicando. Catálogo digital, integración con WhatsApp y diseño profesional. Ideal para emprendedores."
                name="Clicando"
                type="website"
                image={logoClicandoPng}
                url="https://clicando.com.ar"
                schema={jsonLd}
            />
            {/* Theme Toggle */}
            <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="fixed top-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-main)',
                    border: `1px solid var(--color-border)`
                }}
            >
                {theme === 'dark' ? <HiOutlineSun size={24} /> : <HiOutlineMoon size={24} />}
            </motion.button>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-5xl w-full text-center z-10"
            >
                {/* Logo/Icon */}
                <motion.div variants={itemVariants} className="mb-12">
                    <motion.div
                        animate={{
                            y: [0, -12, 0],
                            rotate: [0, 1, -1, 0]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative inline-block"
                    >
                        <img
                            src={logoClicandoPng}
                            alt="Clicando Logo"
                            className="w-44 h-44 mx-auto mb-6 drop-shadow-[0_10px_35px_rgba(0,0,0,0.15)]"
                        />
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-blue-400/10 blur-3xl -z-10 rounded-full scale-125"></div>
                    </motion.div>

                    <h1
                        className="text-5xl md:text-7xl font-black mb-4 tracking-tighter"
                        style={{ color: 'var(--color-text-main)' }}
                    >
                        Clicando
                    </h1>
                    <div className="space-y-3">
                        <p
                            className="text-2xl md:text-3xl font-black tracking-tight"
                            style={{ color: 'var(--color-text-main)' }}
                        >
                            Tu Tienda Online Simple y Rápida
                        </p>
                        <p
                            className="text-xs md:text-sm font-black tracking-[0.2em] md:tracking-[0.3em] uppercase opacity-50 px-4 md:px-0"
                            style={{ color: 'var(--color-text-light)' }}
                        >
                            Catálogo Digital • WhatsApp Integrado
                        </p>
                    </div>
                </motion.div>

                {/* Features */}
                <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-8 mb-16">
                    <div
                        className="group p-8 rounded-3xl backdrop-blur-md transition-all duration-500 text-center"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(255, 255, 255, 0.5)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'var(--color-border)'}`,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-emerald-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
                        >
                            <img
                                src={catalogoIllustration}
                                alt="Catálogo Completo"
                                className="w-20 h-20 object-contain opacity-90"
                            />
                        </motion.div>
                        <h3 className="font-black mb-2 text-lg uppercase tracking-tight" style={{ color: '#475569' }}>
                            Catálogo Completo
                        </h3>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>
                            Gestiona tus productos con eficiencia y estilo.
                        </p>
                    </div>

                    <div
                        className="group p-8 rounded-3xl backdrop-blur-md transition-all duration-500 text-center"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(255, 255, 255, 0.5)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'var(--color-border)'}`,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="bg-emerald-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
                        >
                            <img
                                src={whatsappIllustration}
                                alt="WhatsApp Integrado"
                                className="w-20 h-20 object-contain opacity-90"
                            />
                        </motion.div>
                        <h3 className="font-black mb-2 text-lg uppercase tracking-tight" style={{ color: '#475569' }}>
                            WhatsApp Integrado
                        </h3>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>
                            Recibe pedidos directos sin intermediarios.
                        </p>
                    </div>

                    <div
                        className="group p-8 rounded-3xl backdrop-blur-md transition-all duration-500 text-center"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(255, 255, 255, 0.5)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'var(--color-border)'}`,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="bg-emerald-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
                        >
                            <img
                                src={personalizableIllustration}
                                alt="100% Personalizable"
                                className="w-20 h-20 object-contain opacity-90"
                            />
                        </motion.div>
                        <h3 className="font-black mb-2 text-lg uppercase tracking-tight" style={{ color: '#475569' }}>
                            100% Personalizable
                        </h3>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: '#475569' }}>
                            Tu marca es la protagonista en cada detalle.
                        </p>
                    </div>
                </motion.div>

                {/* Featured Stores Section */}
                {featuredStores.length > 0 && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                        className="mb-20"
                    >
                        <div className="mb-4">
                            <h2 className="text-3xl lg:text-4xl font-black italic" style={{ color: 'var(--color-text-main)' }}>
                                Confían en Nosotros
                            </h2>
                            <p className="text-lg font-medium mt-2 opacity-60" style={{ color: 'var(--color-text-light)' }}>
                                Comercios y emprendedores que ya potencian sus ventas con nuestra plataforma.
                            </p>
                        </div>

                        {/* Robust Carousel Container */}
                        <div className="relative mb-10">
                            {/* Navigation Arrows */}
                            <button
                                onClick={() => {
                                    if (carouselRef.current) {
                                        carouselRef.current.scrollBy({ left: -304, behavior: 'smooth' });
                                    }
                                }}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white'
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <button
                                onClick={() => {
                                    if (carouselRef.current) {
                                        carouselRef.current.scrollBy({ left: 304, behavior: 'smooth' });
                                    }
                                }}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white'
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Scroll Container with CSS Mask */}
                            <div
                                id="featured-stores-carousel"
                                ref={carouselRef}
                                className="flex space-x-8 overflow-x-auto hide-scrollbar pt-4 pb-12 px-12 scroll-smooth"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                                }}
                            >
                                {featuredStores.map(store => (
                                    <StoreCard key={store.id} store={store} />
                                ))}
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05, opacity: 1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowDirectory(true)}
                            className="font-black py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl uppercase tracking-widest text-sm cursor-pointer"
                            style={{
                                background: theme === 'dark' ? 'rgba(248, 250, 252, 0.9)' : 'white',
                                color: 'var(--color-primary)',
                                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'var(--color-primary)'}`,
                            }}
                        >
                            Ver todas las tiendas
                        </motion.button>
                    </motion.div>
                )}

                <motion.div variants={itemVariants} className="mb-0">
                    <section className="relative overflow-hidden rounded-[2rem] shadow-2xl p-8 lg:p-12 backdrop-blur-xl"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(255, 255, 255, 0.4)',
                            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.5)',
                            borderWidth: '1px'
                        }}
                    >
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="space-y-4 max-w-xl text-center lg:text-left">
                                <h2 className="text-3xl lg:text-4xl font-black italic flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4 lg:gap-3" style={{ color: theme === 'dark' ? '#0f172a' : 'var(--color-text-main)' }}>
                                    <span className="text-5xl lg:text-4xl">🗺️</span>
                                    <span>¿Buscás algo cerca?</span>
                                </h2>
                                <p className="text-lg leading-relaxed" style={{ color: theme === 'dark' ? '#475569' : 'var(--color-text-light)' }}>
                                    Explorá nuestro mapa interactivo y descubrí todos los comercios adheridos en tu ciudad. ¡Apoyá lo local!
                                </p>
                            </div>
                            <Link
                                to="/mapa"
                                className="text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center text-center"
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                }}
                            >
                                Abrir Mapa Interactivo
                            </Link>
                        </div>
                    </section>
                </motion.div>

                {/* CTA Final - Centrado vertical entre secciones */}
                <motion.div variants={itemVariants} className="py-16 space-y-4">
                    <div className="relative inline-block group">
                        <Link
                            to="/login"
                            className="relative z-10 inline-block font-black py-4 px-12 rounded-2xl transition-all duration-300 transform shadow-xl uppercase tracking-widest text-sm"
                            style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'white'
                            }}
                        >
                            Acceder a mi Tienda
                        </Link>
                        {/* Shadow decoration */}
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    </div>

                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        ¿Eres cliente? Accede directamente con tu usuario.
                    </p>

                    {/* CTA para nuevos clientes */}
                    {/* CTA para nuevos clientes - UNIFICADO CON MAPA */}
                    <div
                        className="p-8 lg:p-12 rounded-[2rem] backdrop-blur-xl transition-all duration-500 shadow-2xl"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(255, 255, 255, 0.4)',
                            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.5)',
                            borderWidth: '1px'
                        }}
                    >
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="space-y-4 max-w-xl text-center lg:text-left">
                                <h2 className="text-3xl lg:text-4xl font-black italic flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4 lg:gap-3" style={{ color: theme === 'dark' ? '#0f172a' : 'var(--color-text-main)' }}>
                                    <span className="text-5xl lg:text-4xl">🚀</span>
                                    <span>¿Querés tu propia tienda?</span>
                                </h2>
                                <p className="text-lg leading-relaxed" style={{ color: theme === 'dark' ? '#475569' : 'var(--color-text-light)' }}>
                                    Unite a la red comercial más dinámica de la ciudad y potenciá tus ventas con tecnología local.
                                </p>
                            </div>

                            <a
                                href="https://wa.me/5493456533273?text=Hola!%20Me%20interesa%20tener%20mi%20tienda%20online%20con%20Clicando"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm"
                            >
                                <FaWhatsapp className="text-xl" />
                                Solicitala acá
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    variants={itemVariants}
                    className="mt-24 text-[10px] font-black uppercase tracking-[0.3em] opacity-40"
                    style={{ color: 'var(--color-text-light)' }}
                >
                    <p>
                        Desarrollado por{' '}
                        <a
                            href="https://maptiva.github.io/maptiva/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-500 transition-colors"
                        >
                            Maptiva
                        </a>
                    </p>
                </motion.div>
            </motion.div>

            <StoreDirectory
                isOpen={showDirectory}
                onClose={() => setShowDirectory(false)}
            />
        </div>
    );
}

export default LandingPage;
