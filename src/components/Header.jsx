import React from 'react';
import { Link, useParams } from 'react-router-dom';
import logoTitle from '../assets/titulo1.png';
import { useCart } from '../context/CartContext';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';
import { useSearchState } from '../store/useSearchStore';

const Header = ({ storeData, onCartClick }) => {
  const { cart } = useCart();
  const { storeName } = useParams();
  const { theme, toggleTheme } = useTheme();
  const { searchTerm, setSearchTerm } = useSearchState();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Usar datos de la tienda si existen, sino valores por defecto
  const displayLogo = storeData?.logo_url || logoTitle;
  const displayStoreName = storeData?.store_name || 'Tienda Online';

  return (
    <header className="sticky top-0 z-50 bg-surface text-text-light transition-colors duration-300 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28">

          {/* Izquierda: Logo + Nombre */}
          <Link to={`/${storeName}`} className="flex items-center gap-3 flex-1 min-w-0 mr-4">
            <img
              src={displayLogo}
              className="h-24 w-24 object-contain flex-shrink-0"
              alt={`Logo de ${displayStoreName}`}
            />
            <span className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-text-main">
              {displayStoreName}
            </span>
          </Link>

          {/* Centro: SearchBar (solo desktop) */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Buscar productos..."
            />
          </div>

          {/* Derecha: Carrito + Tema */}
          <div className="flex items-center gap-6">

            {/* Carrito */}
            <button
              onClick={onCartClick}
              className="relative text-text-light hover:opacity-80 transition-opacity"
              aria-label={`Ver carrito de compras con ${totalItems} items`}
            >
              <MdOutlineShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Toggle Tema */}
            <button
              onClick={toggleTheme}
              className="text-text-light hover:opacity-80 transition-opacity"
              aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            >
              {theme === 'dark' ? (
                <HiOutlineSun size={24} />
              ) : (
                <HiOutlineMoon size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;