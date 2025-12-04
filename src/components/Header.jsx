import React from 'react';
import { Link, useParams } from 'react-router-dom';
import logoTitle from '../assets/titulo1.png';
import { useCart } from '../context/CartContext';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';

const Header = ({ storeData, onCartClick }) => {
  const { cart } = useCart();
  const { storeName } = useParams();
  const { theme, toggleTheme } = useTheme();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Usar datos de la tienda si existen, sino valores por defecto
  const displayLogo = storeData?.logo_url || logoTitle;
  const displayStoreName = storeData?.store_name || 'Tienda Online';

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-sm transition-colors duration-300"
      style={{
        backgroundColor: theme === 'light'
          ? 'rgba(255, 255, 255, 0.8)'  // surface con transparencia
          : 'rgba(30, 41, 59, 0.8)',     // surface dark con transparencia
        borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#334155'}`
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Izquierda: Logo + Nombre */}
          <Link to={`/${storeName}`} className="flex items-center gap-3">
            <img
              src={displayLogo}
              className="h-14 w-14 object-contain"
              alt={displayStoreName}
            />
            <span
              className="text-2xl font-bold truncate"
              style={{ color: 'var(--color-text-main)' }}
            >
              {displayStoreName}
            </span>
          </Link>

          {/* Centro: SearchBar (solo desktop) */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <SearchBar
              searchTerm=""
              setSearchTerm={() => { }}
              placeholder="Buscar productos..."
            />
          </div>

          {/* Derecha: Carrito + Tema */}
          <div className="flex items-center gap-6" style={{ color: 'var(--color-text-light)' }}>

            {/* Carrito */}
            <div onClick={onCartClick} className="cursor-pointer hover:opacity-80 transition-opacity">
              <div className="relative">
                <MdOutlineShoppingCart size={24} />
                {totalItems !== 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </div>

            {/* Toggle Tema */}
            <div onClick={toggleTheme} className="cursor-pointer hover:opacity-80 transition-opacity">
              {theme === 'dark' ? (
                <HiOutlineSun size={24} />
              ) : (
                <HiOutlineMoon size={24} />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;