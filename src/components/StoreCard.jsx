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
            className="flex-shrink-0 w-64 h-36 rounded-xl shadow-md flex flex-col items-center justify-center p-4 transition-all duration-300 hover:shadow-xl hover:scale-105 relative"
            style={{
                backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'white',
                border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                cursor: store.coming_soon ? 'default' : 'pointer',
                opacity: store.coming_soon ? 0.8 : 1
            }}
        >
            {store.is_demo && (
                <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase z-20 shadow-md">
                    DEMO
                </span>
            )}
            {store.coming_soon && !store.is_demo && (
                <span className="absolute top-2 right-2 bg-slate-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase z-20 shadow-md">
                    PRÓXIMAMENTE
                </span>
            )}

            {store.logo_url ? (
                <img
                    src={store.logo_url}
                    alt={store.store_name}
                    className="rounded-full mb-3 border-2 w-20 h-20 object-contain bg-white p-2 shadow-sm"
                    style={{ borderColor: theme === 'dark' ? '#475569' : '#e2e8f0' }}
                />
            ) : (
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3 shadow-sm">
                    <FaStore className="text-3xl text-slate-300 dark:text-slate-500" />
                </div>
            )}

            <span
                className="text-sm font-bold truncate w-full text-center px-2"
                style={{ color: 'var(--color-text-main)' }}
            >
                {store.store_name}
            </span>
        </CardWrapper>
    );
};

export default StoreCard;
