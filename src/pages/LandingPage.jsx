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
    const carouselRef = React.useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchFeaturedStores = async () => {
            const { data, error } = await supabase
                .from('stores')
                .select('id, store_name, store_slug, logo_url, is_demo, coming_soon, is_active, created_at')
                .limit(20); // Simplified query to avoid filter issues

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
                        Tu Catálogo Digital Simple y Rápido
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-8 mb-16">
                    <div
                        className="group p-8 rounded-3xl backdrop-blur-md transition-all duration-500 text-center"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                            border: `1px solid var(--color-border)`,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
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
                        <h3 className="font-black mb-2 text-lg uppercase tracking-tight" style={{ color: 'var(--color-text-main)' }}>
                            Catálogo Completo
                        </h3>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-light)' }}>
                            Gestiona tus productos con eficiencia y estilo.
                        </p>
                    </div>

                    <div
                        className="group p-8 rounded-3xl backdrop-blur-md transition-all duration-500 text-center"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                            border: `1px solid var(--color-border)`,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
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
                        <h3 className="font-black mb-2 text-lg uppercase tracking-tight" style={{ color: 'var(--color-text-main)' }}>
                            WhatsApp Integrado
                        </h3>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-light)' }}>
                            Recibe pedidos directos sin intermediarios.
                        </p>
                    </div>

                    <div
                        className="group p-8 rounded-3xl backdrop-blur-md transition-all duration-500 text-center"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                            border: `1px solid var(--color-border)`,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
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
                        <h3 className="font-black mb-2 text-lg uppercase tracking-tight" style={{ color: 'var(--color-text-main)' }}>
                            100% Personalizable
                        </h3>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-light)' }}>
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
                        <h2 className="text-3xl font-black mb-10 italic" style={{ color: 'var(--color-text-main)' }}>
                            Confían en Nosotros
                        </h2>
{/* Carousel Container */}
                        <div className="relative overflow-hidden group mb-10">
                            <div 
                                ref={carouselRef}
                                className="flex space-x-8 whitespace-nowrap py-4 cursor-grab active:cursor-grabbing overflow-x-auto scrollbar-hide scroll-smooth"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                    setDragStart({ x: e.pageX, y: e.pageY });
                                    
                                    const slider = e.currentTarget;
                                    const scrollLeft = slider.scrollLeft;
                                    
                                    const handleMouseMove = (e) => {
                                        if (!isDragging) return;
                                        
                                        const currentX = e.pageX;
                                        const currentY = e.pageY;
                                        const deltaX = currentX - dragStart.x;
                                        const deltaY = currentY - dragStart.y;
                                        
                                        // Solo si el movimiento es más horizontal que vertical
                                        if (Math.abs(deltaX) > Math.abs(deltaY)) {
                                            slider.scrollLeft = scrollLeft - deltaX * 0.8; // Más ligero
                                        }
                                    };
                                    
                                    const handleMouseUp = () => {
                                        setTimeout(() => setIsDragging(false), 100); // Pequeña demora
                                        document.removeEventListener('mousemove', handleMouseMove);
                                        document.removeEventListener('mouseup', handleMouseUp);
                                    };
                                    
                                    document.addEventListener('mousemove', handleMouseMove);
                                    document.addEventListener('mouseup', handleMouseUp);
                                }}
                            >
                                {/* Duplicate stores for infinite scroll effect */}
                                {[...featuredStores, ...featuredStores].map((store, index) => {
                                    const CardWrapper = store.coming_soon ? 'div' : Link;
                                    const cardProps = store.coming_soon ? {} : { to: `/${store.store_slug}` };

                                    return (
                                        <div
                                            key={`${store.id}-${index}`}
                                            onClick={() => {
                                                if (!isDragging && !store.coming_soon) {
                                                    window.location.href = `/${store.store_slug}`;
                                                }
                                            }}
                                        >
                                            <motion.div
                                                whileHover={{ y: -8, scale: 1.02 }}
                                                className="w-72 h-40 bg-white/50 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl shadow-md flex flex-col items-center justify-center p-6 border border-gray-100 dark:border-slate-700/50 hover:shadow-xl transition-all relative"
                                                style={{
                                                    cursor: store.coming_soon ? 'default' : (isDragging ? 'grabbing' : 'pointer'),
                                                    opacity: store.coming_soon ? 0.8 : 1,
                                                }}
                                            >
                                                {store.is_demo && (
                                                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase italic tracking-tighter z-10">
                                                        DEMO
                                                    </span>
                                                )}
                                                {store.coming_soon && !store.is_demo && (
                                                    <span className="absolute top-3 right-3 bg-slate-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase italic tracking-tighter z-10">
                                                        PRÓXIMAMENTE
                                                    </span>
                                                )}

                                                <div className="mb-3 relative">
                                                    {store.logo_url ? (
                                                        <img
                                                            src={store.logo_url}
                                                            alt={store.store_name}
                                                            className="w-20 h-20 mx-auto rounded-full object-contain bg-white p-2 shadow-inner border-2 border-slate-50 dark:border-slate-700"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                            <FaStore className="text-4xl text-slate-300 dark:text-slate-500" />
                                                        </div>
                                                    )}
                                                </div>

                                                <h3 className="font-black text-sm truncate uppercase tracking-tight text-center px-2" style={{ color: 'var(--color-text-main)' }}>
                                                    {store.store_name}
                                                </h3>
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Fade Edges */}
                            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background-light dark:from-background-dark to-transparent z-10 pointer-events-none"></div>
                            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background-light dark:from-background-dark to-transparent z-10 pointer-events-none"></div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowDirectory(true)}
                            className="font-black py-4 px-10 rounded-2xl transition-all duration-300 shadow-md uppercase tracking-widest text-xs"
                            style={{
                                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
                                color: 'var(--color-primary)',
                                border: '1px solid var(--color-primary)',
                                opacity: 0.8
                            }}
                        >
                            Ver todas las tiendas
                        </motion.button>
                    </motion.div>
                )}

                <motion.div variants={itemVariants} className="mb-20">
                    <div
                        className="p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center text-center gap-4 border-[3px]"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.2)' : '#F9F7F4',
                            borderColor: 'var(--color-primary)'
                        }}
                    >
                        {/* Abstract Map Background Decoration - Even more subtle */}
                        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none -z-10 text-turquesa-500">
                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                        </div>

                        <motion.div
                            className="text-7xl md:text-8xl mb-2 drop-shadow-lg"
                            style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
                        >
                            🗺️
                        </motion.div>

                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tighter italic" style={{ color: 'var(--color-text-main)' }}>
                                Mapa Interactivo
                            </h2>
                            <p className="text-base md:text-lg font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed max-w-md mx-auto">
                                Descubrí todos los comercios adheridos cerca de tu ubicación en tiempo real.
                            </p>
                        </div>

                        <div className="relative group/btn">
                            {/* Subtle Pulse Effect */}
                            <motion.div
                                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-turquesa-400 rounded-2xl -z-10 blur-md"
                            />

                            <Link
                                to="/mapa"
                                className="inline-block font-black py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-md uppercase tracking-widest text-xs"
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white'
                                }}
                            >
                                Abrir Mapa Interactivo
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Final */}
                <motion.div variants={itemVariants} className="space-y-6">
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

                    <p className="text-sm font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Gestión profesional para clientes Clicando
                    </p>

                    {/* CTA para nuevos clientes */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="mt-12 p-10 rounded-[2.5rem] backdrop-blur-md transition-all duration-500 border-[3px] shadow-2xl"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.2)' : '#F9F7F4',
                            borderColor: 'var(--color-primary)'
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
