import React from 'react';
import { Link } from 'react-router-dom';
import { FaStore } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const StoreCard = ({ store }) => {
    const { theme } = useTheme();
    const CardWrapper = store.coming_soon ? 'div' : Link;
    const cardProps = store.coming_soon ? {} : { to: `/${store.store_slug}` };

    // Placeholder data if missing (for existing stores before migration/manual update)
    const category = store.category || 'Maptiva Store';
    const description = store.short_description || 'Descubrí los mejores productos en nuestra tienda.';
    const isOpen = store.is_open !== undefined ? store.is_open : true;

    return (
        <CardWrapper
            {...cardProps}
            className="flex-shrink-0 w-72 group rounded-3xl transition-all duration-500 hover:scale-[1.03] relative overflow-hidden flex flex-col"
            style={{
                backgroundColor: theme === 'dark' ? 'rgba(248, 250, 252, 0.95)' : 'white',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0,0,0,0.05)'}`,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                cursor: store.coming_soon ? 'default' : 'pointer',
                opacity: store.coming_soon ? 0.8 : 1
            }}
        >
            {/* Soft Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#5FAFB8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Status Badges */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                {store.is_demo && (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-lg shadow-amber-500/20">
                        DEMO
                    </span>
                )}
                {store.coming_soon && !store.is_demo && (
                    <span className="bg-slate-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-lg shadow-slate-500/20">
                        PRÓXIMAMENTE
                    </span>
                )}
            </div>

            {/* Content Container */}
            <div className="p-8 flex flex-col items-center text-center relative z-10">
                {/* Logo with Ring */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-[#5FAFB8]/20 blur-xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
                    <div className="w-24 h-24 rounded-full p-1 bg-white shadow-inner flex items-center justify-center border border-gray-100 ring-4 ring-transparent group-hover:ring-[#5FAFB8]/10 transition-all duration-500">
                        {store.logo_url ? (
                            <img
                                src={store.logo_url}
                                alt={store.store_name}
                                className="w-full h-full rounded-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center">
                                <FaStore className="text-4xl text-slate-200" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="space-y-1 mb-4">
                    <h3
                        className="text-xl font-black tracking-tight leading-tight"
                        style={{ color: '#475569' }} // Same dark gray as description
                    >
                        {store.store_name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-60">
                        <span style={{ color: '#475569' }}>{category}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className={isOpen ? 'text-emerald-500' : 'text-rose-500'} title="Sincronización automática en desarrollo">
                            {isOpen ? '🟢 Abierto' : '🔴 Cerrado'} <span className="text-[8px] opacity-70">(Beta)</span>
                        </span>
                    </div>
                </div>

                <div className="w-12 h-0.5 bg-gray-100 mb-4 group-hover:w-20 group-hover:bg-[#5FAFB8]/30 transition-all duration-500" />

                <p className="text-sm font-medium leading-relaxed mb-6 px-4 line-clamp-2" style={{ color: '#475569' }}>
                    {description}
                </p>

                {/* CTA Button */}
                {!store.coming_soon && (
                    <div
                        className="mt-auto w-full py-3 bg-[#5FAFB8] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#5FAFB8]/20 transition-all duration-300 group-hover:bg-[#4A9BA4] group-hover:shadow-[#4A9BA4]/30"
                    >
                        Ver Catálogo →
                    </div>
                )}
            </div>
        </CardWrapper>
    );
};

export default StoreCard;
