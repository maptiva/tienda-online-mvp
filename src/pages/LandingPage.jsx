import React from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaShoppingCart, FaWhatsapp, FaCog } from 'react-icons/fa';

function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <div className="max-w-4xl w-full text-center">
                {/* Logo/Icon */}
                <div className="mb-8">
                    <FaStore className="text-orange-500 text-6xl mx-auto mb-4" />
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Tu Tienda Online
                    </h1>
                    <p className="text-xl text-slate-300">
                        Plataforma profesional de comercio electrónico
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700">
                        <FaShoppingCart className="text-orange-500 text-3xl mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">Catálogo Completo</h3>
                        <p className="text-slate-400 text-sm">
                            Gestiona tus productos fácilmente
                        </p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700">
                        <FaWhatsapp className="text-orange-500 text-3xl mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">WhatsApp Integrado</h3>
                        <p className="text-slate-400 text-sm">
                            Recibe pedidos directamente
                        </p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700">
                        <FaCog className="text-orange-500 text-3xl mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">100% Personalizable</h3>
                        <p className="text-slate-400 text-sm">
                            Tu marca, tu estilo
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="space-y-4">
                    <Link
                        to="/login"
                        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Acceder a mi Tienda
                    </Link>
                    <p className="text-slate-400 text-sm">
                        ¿Eres cliente? Accede directamente a tu tienda usando el enlace que te compartieron
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-16 text-slate-500 text-sm">
                    <p>Plataforma SaaS Multi-Tenant</p>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
