import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import logoTitle from '../assets/titulo1.png';
import { useCart } from '../context/CartContext';
import { CiLocationOn } from 'react-icons/ci';
import { PiPhone } from 'react-icons/pi';
import { BsClock } from 'react-icons/bs';
import { FaInstagram, FaFacebook } from 'react-icons/fa';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

const Header = ({ storeData, onCartClick }) => {
  const { cart } = useCart();
  const { storeName } = useParams();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };

    // Usar requestAnimationFrame para suavizar la detección
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Usar datos de la tienda si existen, sino valores por defecto
  const displayLogo = storeData?.logo_url || logoTitle;
  const displayPhone = storeData?.contact_phone || '+ (3456) 445977';
  const displayAddress = storeData?.address || 'Tienda Online';
  const displayHours = storeData?.business_hours || 'Lun-Sab: 9:00 - 20:00';
  const displayInstagram = storeData?.instagram_url;
  const displayFacebook = storeData?.facebook_url;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-slate-800'}`}
      style={{ willChange: 'height' }}
    >
      <div
        className='border-b border-slate-700 transition-all duration-300 overflow-hidden'
        style={{
          maxHeight: isScrolled ? '0px' : '200px',
          opacity: isScrolled ? 0 : 1
        }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm'>
            <div className='flex gap-2 items-center' >
              <CiLocationOn color='#ff6900' size={20} />
              <p className='text-white transition-colors duration-300'>{displayAddress}</p>
            </div>

            <div className='flex gap-2 items-center' >
              <PiPhone color='#ff6900' size={20} />
              <p className='text-white transition-colors duration-300'>{displayPhone}</p>
            </div>

            <div className='flex gap-2 items-center' >
              <BsClock color='#ff6900' size={20} />
              <p className='text-white transition-colors duration-300'>{displayHours}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-between py-5 mx-10'>
        <Link to={`/${storeName}`}>
          <div className=''>
            <img
              src={displayLogo}
              className='w-25 h-15 max-h-16 object-contain'
              alt={storeData?.store_name || "Store Logo"}
            />
          </div>
        </Link>
        <div className='flex gap-5 m-2'>
          {displayInstagram && (
            <a
              href={displayInstagram}
              target="_blank"
              rel="noopener noreferrer"
              className='cursor-pointer'
            >
              <FaInstagram size={25} className='text-white hover:text-[#ff6900] transition-all duration-300' />
            </a>
          )}
          {displayFacebook && (
            <a
              href={displayFacebook}
              target="_blank"
              rel="noopener noreferrer"
              className='cursor-pointer'
            >
              <FaFacebook size={25} className='text-white hover:text-[#ff6900] transition-all duration-300' />
            </a>
          )}
          <div onClick={onCartClick} className='cursor-pointer'>
            <div className="relative">
              <MdOutlineShoppingCart size={25} className='text-white hover:text-[#ff6900] transition-all duration-300' />
              {
                totalItems !== 0 &&
                <p className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </p>
              }
            </div>
          </div>
          <div onClick={toggleTheme} className='cursor-pointer ml-3'>
            {theme === 'dark' ? (
              <HiOutlineSun size={25} className='text-white hover:text-[#ff6900] transition-all duration-300' />
            ) : (
              <HiOutlineMoon size={25} className='text-white hover:text-[#ff6900] transition-all duration-300' />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;