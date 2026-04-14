import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import logoTitle from '../assets/titulo1.png';
import { useCart } from '../context/CartContext';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { FiInfo } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';
import { useSearchState } from '../store/useSearchStore';
import { useCategory } from '../hooks/categoria/useCategory';
import AboutModal from './public/AboutModal';
import { type Store } from '../schemas/store.schema';

interface HeaderProps {
  storeData?: Store & { about_text?: string };
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ storeData, onCartClick }) => {
  const { cart } = useCart();
  const { storeName } = useParams<{ storeName: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { searchTerm, setSearchTerm } = useSearchState();
  const { limpiarCategoryActive } = useCategory();
  const [showAbout, setShowAbout] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const displayLogo = storeData?.logo_url || logoTitle;
  const displayStoreName = storeData?.store_name || 'Tienda Online';

  const handleLogoClick = async () => {
    const targetPath = `/${storeName}`;
    setSearchTerm('');
    await limpiarCategoryActive();
    sessionStorage.removeItem(`scroll_state_${window.location.pathname}`);
    sessionStorage.removeItem(`scroll_state_${targetPath}`);
    sessionStorage.setItem('logo_navigate', 'true');
    await navigate(targetPath, { replace: true });
    setTimeout(() => window.scrollTo(0, 0), 100);
    setTimeout(() => window.scrollTo(0, 0), 300);
    setTimeout(() => window.scrollTo(0, 0), 500);
    setTimeout(() => sessionStorage.removeItem('logo_navigate'), 1000);
  };

  return (
    <header
      className="sticky top-0 z-50 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: `1px solid var(--color-border)`
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28">

          {/* Izquierda: Clicando Logo + Tienda Logo + Nombre */}
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
            <div id="clicando-brand-button-container" className="hidden md:flex md:items-center"></div>

            {/* Link de la Tienda */}
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-3 bg-transparent border-none cursor-pointer"
            >
              <img
                src={displayLogo}
                className="h-24 w-24 object-contain flex-shrink-0"
                alt={displayStoreName}
              />
              <span
                className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight"
                style={{ color: 'var(--color-text-main)' }}
              >
                {displayStoreName}
              </span>
            </button>
          </div>

          {/* Centro: SearchBar (solo desktop) */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Buscar productos..."
            />
          </div>

          {/* Derecha: Carrito + Tema + Info */}
          <div
            className="flex items-center gap-4 md:gap-6"
            style={{ color: theme === 'dark' ? '#f1f5f9' : 'var(--color-text-light)' }}
          >

            {/* Icono Info (Nosotros) */}
            <button
              onClick={() => setShowAbout(true)}
              className="cursor-pointer hover:opacity-80 transition-opacity p-1"
              aria-label="Información"
              title="Nosotros"
            >
              <FiInfo size={22} />
            </button>

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

      {/* Modal Nosotros */}
      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        storeName={displayStoreName}
        storeAboutText={storeData?.about_text}
      />
    </header>
  );
};

export default Header;