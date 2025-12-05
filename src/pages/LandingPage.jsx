import React from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaShoppingCart, FaWhatsapp, FaCog } from 'react-icons/fa';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

function LandingPage() {
    const { theme, toggleTheme } = useTheme();

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
                className="absolute top-4 right-4 p-3 rounded-full transition-all duration-300 hover:opacity-80"
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
                    <FaStore
                        className="text-8xl mx-auto mb-4"
                        style={{ color: 'var(--color-primary)' }}
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
        </div>
    );
}

export default LandingPage;
