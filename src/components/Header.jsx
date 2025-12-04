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
      className={`sticky top-0 z-50 transition-colors duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-slate-800'}`}
    >
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between gap-4">

          {/* Izquierda: Logo + Nombre */}
          <Link to={`/${storeName}`} className="flex items-center gap-3">
            <img
              src={displayLogo}
              className="h-16 w-16 md:h-24 md:w-24 object-contain"
              alt={displayStoreName}
            />
            <h1 className="text-white text-xl md:text-3xl font-bold truncate leading-normal">
              {displayStoreName}
            </h1>
          </Link>

          {/* Derecha: SearchBar (desktop) + Carrito + Tema */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* SearchBar - Solo desktop */}
            <div className="hidden md:block">
              <SearchBar
                searchTerm=""
                setSearchTerm={() => { }}
                placeholder="Buscar productos..."
              />
            </div>

            {/* Carrito */}
            <div onClick={onCartClick} className="cursor-pointer">
              <div className="relative">
                <MdOutlineShoppingCart
                  size={25}
                  className="text-white hover:text-[#ff6900] transition-all duration-300"
                />
                {totalItems !== 0 && (
                  <p className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </p>
                )}
              </div>
            </div>

            {/* Toggle Tema */}
            <div onClick={toggleTheme} className="cursor-pointer">
              {theme === 'dark' ? (
                <HiOutlineSun
                  size={25}
                  className="text-white hover:text-[#ff6900] transition-all duration-300"
                />
              ) : (
                <HiOutlineMoon
                  size={25}
                  className="text-white hover:text-[#ff6900] transition-all duration-300"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;