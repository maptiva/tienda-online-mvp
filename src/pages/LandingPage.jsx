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

function LandingPage() {
    const { theme, toggleTheme } = useTheme();
    const [featuredStores, setFeaturedStores] = useState([]);
    const [showDirectory, setShowDirectory] = useState(false);

    useEffect(() => {
        const fetchFeaturedStores = async () => {
            const { data, error } = await supabase
                .from('stores')
                .select('id, store_name, store_slug, logo_url, is_demo, coming_soon, is_active, created_at')
                .or('is_active.eq.true,coming_soon.eq.true')
                .limit(12); // Fetch more to sort and then pick top 4

            if (error) {
                console.error("Error fetching featured stores:", error);
                return;
            }

            if (data) {
                // Custom sorting logic
                const getStoreRank = (store) => {
                    if (store.is_active && !store.is_demo && !store.coming_soon) {
                        return 1; // Active
                    }
                    if (store.is_demo) {
                        return 2; // Demo
                    }
                    if (store.coming_soon) {
                        return 3; // Coming soon
                    }
                    return 4; // Others
                };

                const sortedData = data.sort((a, b) => {
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

                setFeaturedStores(sortedData.slice(0, 4));
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
                        className="text-6xl font-black mb-3 tracking-tighter italic"
                        style={{ color: 'var(--color-text-main)' }}
                    >
                        Clicando
                    </h1>
                    <p
                        className="text-2xl font-medium tracking-tight"
                        style={{ color: 'var(--color-text-light)' }}
                    >
                        Tu Tienda Online Simple y Rápida
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-8 mb-16">
                    <div
                        className="group p-8 rounded-3xl backdrop-blur-md transition-all duration-500 text-center hover:transform hover:-translate-y-2"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                            border: `1px solid var(--color-border)`,
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <div className="bg-blue-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                            <img
                                src={catalogoIllustration}
                                alt="Catálogo Completo"
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                        <h3 className="font-black mb-2 text-lg uppercase tracking-tight" style={{ color: 'var(--color-text-main)' }}>
                            Catálogo Maestro
                        </h3>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-light)' }}>
                            Gestiona tus productos con eficiencia y estilo.
                        </p>
                    </div>

                    <div
                        className="group p-8 rounded-3xl backdrop-blur-md transition-all duration-500 text-center hover:transform hover:-translate-y-2"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                            border: `1px solid var(--color-border)`,
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <div className="bg-emerald-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                            <img
                                src={whatsappIllustration}
                                alt="WhatsApp Integrado"
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                        <h3 className="font-black mb-2 text-lg uppercase tracking-tight" style={{ color: 'var(--color-text-main)' }}>
                            Flujo WhatsApp
                        </h3>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-light)' }}>
                            Recibe pedidos directos sin intermediarios.
                        </p>
                    </div>

                    <div
                        className="group p-8 rounded-3xl backdrop-blur-md transition-all duration-500 text-center hover:transform hover:-translate-y-2"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                            border: `1px solid var(--color-border)`,
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <div className="bg-amber-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                            <img
                                src={personalizableIllustration}
                                alt="100% Personalizable"
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                        <h3 className="font-black mb-2 text-lg uppercase tracking-tight" style={{ color: 'var(--color-text-main)' }}>
                            Identidad Única
                        </h3>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-light)' }}>
                            Tu marca es la protagonista en cada detalle.
                        </p>
                    </div>
                </motion.div>

                {/* Featured Stores Section */}
                {featuredStores.length > 0 && (
                    <motion.div variants={itemVariants} className="mb-20">
                        <h2 className="text-3xl font-black mb-10 italic" style={{ color: 'var(--color-text-main)' }}>
                            Comercios en el Radar
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                            {featuredStores.map(store => {
                                const CardWrapper = store.coming_soon ? 'div' : Link;
                                const cardProps = store.coming_soon ? {} : { to: `/${store.store_slug}` };

                                return (
                                    <motion.div
                                        key={store.id}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className="relative"
                                    >
                                        <CardWrapper {...cardProps}
                                            className="block p-5 rounded-2xl transition-all duration-500 relative bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl"
                                            style={{
                                                cursor: store.coming_soon ? 'default' : 'pointer',
                                                opacity: store.coming_soon ? 0.8 : 1,
                                            }}
                                        >
                                            {store.is_demo && (
                                                <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase italic tracking-tighter z-10">
                                                    DEMO
                                                </span>
                                            )}
                                            {store.coming_soon && !store.is_demo && (
                                                <span className="absolute top-3 right-3 bg-slate-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase italic tracking-tighter z-10">
                                                    PRÓXIMAMENTE
                                                </span>
                                            )}

                                            <div className="mb-4 relative">
                                                {store.logo_url ? (
                                                    <img
                                                        src={store.logo_url}
                                                        alt={store.store_name}
                                                        className="w-24 h-24 mx-auto rounded-full object-contain bg-white p-1 shadow-inner border-2 border-slate-50 dark:border-slate-700"
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                        <FaStore className="text-4xl text-slate-300 dark:text-slate-500" />
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="font-black text-sm truncate uppercase tracking-tight" style={{ color: 'var(--color-text-main)' }}>
                                                {store.store_name}
                                            </h3>
                                        </CardWrapper>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowDirectory(true)}
                            className="font-black py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg uppercase tracking-widest text-xs"
                            style={{
                                background: 'white',
                                color: 'var(--color-primary)',
                                border: '2px solid var(--color-primary)'
                            }}
                        >
                            Ver Red Completa
                        </motion.button>
                    </motion.div>
                )}

                {/* Mapa Interactivo CTA - Rediseñado "Ah, el mapa!" */}
                <motion.div variants={itemVariants} className="mb-20">
                    <div
                        className="p-1 md:p-1.5 rounded-[2.5rem] shadow-2xl overflow-hidden relative group"
                        style={{
                            background: 'linear-gradient(45deg, var(--color-primary), #4FBCC4, #5FAFB8)'
                        }}
                    >
                        <div
                            className="p-10 md:p-14 rounded-[2.2rem] overflow-hidden relative flex flex-col items-center justify-center text-center gap-8 backdrop-blur-3xl bg-white/90 dark:bg-slate-900/90"
                        >
                            {/* Abstract Map Background Decoration */}
                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none -z-10">
                                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                            </div>

                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 6, repeat: Infinity }}
                                className="text-6xl md:text-7xl mb-2"
                            >
                                🗺️
                            </motion.div>

                            <div className="max-w-2xl">
                                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter italic" style={{ color: 'var(--color-text-main)' }}>
                                    Explorá el Mapa de Tiendas
                                </h2>
                                <p className="text-lg md:text-xl font-medium text-gray-500 dark:text-gray-400 mb-8 leading-tight">
                                    Descubrí todos los comercios adheridos cerca de tu ubicación en tiempo real.
                                    <span className="block mt-1 font-bold text-blue-500">Simple, visual y dinámico.</span>
                                </p>
                            </div>

                            <div className="relative">
                                {/* Pulse Effect */}
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-blue-400 rounded-2xl -z-10"
                                />

                                <Link
                                    to="/mapa"
                                    className="block font-black py-5 px-14 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl uppercase tracking-[0.15em] text-sm"
                                    style={{
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white'
                                    }}
                                >
                                    Abrir Mapa Interactivo
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Final */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="relative inline-block group">
                        <Link
                            to="/login"
                            className="relative z-10 inline-block font-black py-5 px-12 rounded-2xl transition-all duration-300 transform shadow-xl uppercase tracking-widest text-sm"
                            style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'white'
                            }}
                        >
                            Acceder a mi Panel
                        </Link>
                        {/* Shadow decoration */}
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    </div>

                    <p className="text-sm font-bold uppercase tracking-widest opacity-40" style={{ color: 'var(--color-text-light)' }}>
                        Gestión profesional para clientes Clicando
                    </p>

                    {/* CTA para nuevos clientes */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="mt-12 p-10 rounded-[2.5rem] backdrop-blur-md transition-all duration-500 border border-white/50 dark:border-slate-800 shadow-2xl"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.2)' : 'rgba(255, 255, 255, 0.4)',
                        }}
                    >
                        <h4 className="text-2xl font-black mb-2 italic" style={{ color: 'var(--color-text-main)' }}>
                            ¿Querés tu propia tienda?
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                            Unite a la red comercial más dinámica de la ciudad.
                        </p>

                        <a
                            href="https://wa.me/5493456533273?text=Hola!%20Me%20interesa%20tener%20mi%20tienda%20online%20con%20Clicando"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs"
                        >
                            <FaWhatsapp className="text-xl" />
                            Solicitá tu Catálogo
                        </a>
                    </motion.div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    variants={itemVariants}
                    className="mt-24 text-[10px] font-black uppercase tracking-[0.3em] opacity-40"
                    style={{ color: 'var(--color-text-light)' }}
                >
                    <p>
                        Engineered by{' '}
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
