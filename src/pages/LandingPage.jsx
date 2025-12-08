import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaWhatsapp, FaCog } from 'react-icons/fa';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import StoreDirectory from '../components/StoreDirectory';
import logoClicandoPng from '../assets/logo-clicando.png';

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

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300 relative"
            style={{
                background: theme === 'dark'
                    ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
                    : 'linear-gradient(to bottom right, #E8E2DB, #F5F1ED, #E8E2DB)'
            }}
        >
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:opacity-80"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-main)',
                    border: `1px solid var(--color-border)`
                }}
            >
                {theme === 'dark' ? (
                    <HiOutlineSun size={24} />
                ) : (
                    <HiOutlineMoon size={24} />
                )}
            </button>

            <div className="max-w-4xl w-full text-center">
                {/* Logo/Icon */}
                <div className="mb-8">
                    <img
                        src={logoClicandoPng}
                        alt="Clicando Logo"
                        className="w-40 h-40 mx-auto mb-4"
                    />
                    <h1
                        className="text-5xl font-bold mb-4"
                        style={{ color: 'var(--color-text-main)' }}
                    >
                        Clicando
                    </h1>
                    <p
                        className="text-xl"
                        style={{ color: 'var(--color-text-light)' }}
                    >
                        Tu Tienda Online Simple y Rápida
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div
                        className="p-6 rounded-xl backdrop-blur transition-colors duration-300"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: `1px solid var(--color-border)`
                        }}
                    >
                        <FaShoppingCart
                            className="text-3xl mx-auto mb-3"
                            style={{ color: 'var(--color-primary)' }}
                        />
                        <h3
                            className="font-semibold mb-2"
                            style={{ color: 'var(--color-text-main)' }}
                        >
                            Catálogo Completo
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--color-text-light)' }}
                        >
                            Gestiona tus productos fácilmente
                        </p>
                    </div>

                    <div
                        className="p-6 rounded-xl backdrop-blur transition-colors duration-300"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: `1px solid var(--color-border)`
                        }}
                    >
                        <FaWhatsapp
                            className="text-3xl mx-auto mb-3"
                            style={{ color: 'var(--color-primary)' }}
                        />
                        <h3
                            className="font-semibold mb-2"
                            style={{ color: 'var(--color-text-main)' }}
                        >
                            WhatsApp Integrado
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--color-text-light)' }}
                        >
                            Recibe pedidos directamente
                        </p>
                    </div>

                    <div
                        className="p-6 rounded-xl backdrop-blur transition-colors duration-300"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: `1px solid var(--color-border)`
                        }}
                    >
                        <FaCog
                            className="text-3xl mx-auto mb-3"
                            style={{ color: 'var(--color-primary)' }}
                        />
                        <h3
                            className="font-semibold mb-2"
                            style={{ color: 'var(--color-text-main)' }}
                        >
                            100% Personalizable
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--color-text-light)' }}
                        >
                            Tu marca, tu estilo
                        </p>
                    </div>
                </div>

                {/* Featured Stores Section */}
                {featuredStores.length > 0 && (
                    <div className="mb-16">
                        <h2
                            className="text-3xl font-bold mb-8"
                            style={{ color: 'var(--color-text-main)' }}
                        >
                            Confían en Clicando
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            {featuredStores.map(store => {
                                const CardWrapper = store.coming_soon ? 'div' : Link;
                                const cardProps = store.coming_soon ? {} : { to: `/${store.store_slug}` };

                                return (
                                    <CardWrapper {...cardProps}
                                        key={store.id}
                                        className="p-4 rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 relative"
                                        style={{
                                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                                            border: `1px solid var(--color-border)`,
                                            cursor: store.coming_soon ? 'default' : 'pointer',
                                            opacity: store.coming_soon ? 0.8 : 1,
                                        }}
                                    >
                                        {store.is_demo && (
                                            <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded" style={{ fontSize: '0.65rem' }}>
                                                DEMO
                                            </span>
                                        )}
                                        {store.coming_soon && !store.is_demo && (
                                            <span className="absolute top-2 right-2 bg-slate-500 text-white text-xs font-bold px-2 py-1 rounded" style={{ fontSize: '0.65rem' }}>
                                                PRÓXIMAMENTE
                                            </span>
                                        )}
                                        {store.logo_url ? (
                                            <img
                                                src={store.logo_url}
                                                alt={store.store_name}
                                                className="w-20 h-20 mx-auto rounded-full object-contain bg-white p-1 shadow-sm mb-3"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 mx-auto rounded-full bg-slate-200 flex items-center justify-center mb-3">
                                                <FaStore className="text-3xl text-slate-400" />
                                            </div>
                                        )}
                                        <h3
                                            className="font-semibold text-sm truncate"
                                            style={{ color: 'var(--color-text-main)' }}
                                        >
                                            {store.store_name}
                                        </h3>
                                    </CardWrapper>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setShowDirectory(true)}
                            className="font-semibold py-2 px-6 rounded-full transition-colors border-2"
                            style={{
                                borderColor: 'var(--color-primary)',
                                color: 'var(--color-primary)'
                            }}
                        >
                            Ver todas las tiendas
                        </button>
                    </div>
                )}

                {/* CTA */}
                <div className="space-y-4">
                    <Link
                        to="/login"
                        className="inline-block font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-primary-text)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--color-primary-darker)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'var(--color-primary)';
                        }}
                    >
                        Acceder a mi Tienda
                    </Link>
                    <p
                        className="text-sm"
                        style={{ color: 'var(--color-text-light)' }}
                    >
                        ¿Eres cliente? Accede directamente con tu usuario
                    </p>

                    {/* CTA para nuevos clientes */}
                    <div
                        className="mt-8 p-6 rounded-xl transition-colors duration-300"
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                            border: `1px solid var(--color-border)`
                        }}
                    >
                        <p
                            className="mb-3"
                            style={{ color: 'var(--color-text-main)' }}
                        >
                            ¿Aún no tienes tu tienda online?
                        </p>
                        <a
                            href="https://wa.me/5493456533273?text=Hola!%20Me%20interesa%20tener%20mi%20tienda%20online%20con%20Clicando"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <FaWhatsapp className="text-xl" />
                            Solicitá la tuya
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="mt-16 text-sm"
                    style={{ color: 'var(--color-text-light)' }}
                >
                    <p>
                        Desarrollado por{' '}
                        <a
                            href="https://maptiva.github.io/maptiva/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            Maptiva
                        </a>
                    </p>
                </div>
            </div>

            <StoreDirectory
                isOpen={showDirectory}
                onClose={() => setShowDirectory(false)}
            />
        </div>
    );
}

export default LandingPage;
