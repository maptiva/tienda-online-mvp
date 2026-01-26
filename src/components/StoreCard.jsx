import React from 'react';
import { Link } from 'react-router-dom';
import { FaStore } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const StoreCard = ({ store }) => {
    const { theme } = useTheme();
    const CardWrapper = store.coming_soon ? 'div' : Link;
    const cardProps = store.coming_soon ? {} : { to: `/${store.store_slug}` };

    return (
        <CardWrapper
            {...cardProps}
            className="flex-shrink-0 w-72 h-48 rounded-xl shadow-md flex flex-col items-center justify-between p-4 transition-all duration-300 hover:shadow-xl hover:scale-105 relative"
            style={{
                backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'white',
                border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                cursor: store.coming_soon ? 'default' : 'pointer',
                opacity: store.coming_soon ? 0.8 : 1
            }}
        >
            {store.is_demo && (
                <span className="absolute top-2 right-2 bg-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase z-20 shadow-md">
                    DEMO
                </span>
            )}
            {store.coming_soon && !store.is_demo && (
                <span className="absolute top-2 right-2 bg-slate-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase z-20 shadow-md">
                    PRÓXIMAMENTE
                </span>
            )}

            {/* Logo Container */}
            <div className="flex-shrink-0 flex items-center justify-center">
                {store.logo_url ? (
                    <img
                        src={store.logo_url}
                        alt={store.store_name}
                        className="rounded-full border-2 w-20 h-20 object-contain bg-white p-2 shadow-sm"
                        style={{ borderColor: theme === 'dark' ? '#475569' : '#e2e8f0' }}
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-sm">
                        <FaStore className="text-3xl text-slate-300 dark:text-slate-500" />
                    </div>
                )}
            </div>

            {/* Store Name Container - con más espacio */}
            <div className="flex-grow flex items-center justify-center min-h-0">
                <span
                    className="text-sm font-bold text-center px-2 w-full leading-tight"
                    style={{ 
                        color: 'var(--color-text-main)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {store.store_name}
                </span>
            </div>
        </CardWrapper>
    );
};

export default StoreCard;
