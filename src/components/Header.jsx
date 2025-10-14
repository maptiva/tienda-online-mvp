import React from 'react';
import { Link } from 'react-router-dom';
import logoTitle from '../assets/titulo1.png';
import { useCart } from '../context/CartContext';
import { CiLocationOn } from 'react-icons/ci';
import { PiPhone } from 'react-icons/pi';
import { BsClock } from 'react-icons/bs';
import { FaInstagram } from 'react-icons/fa';
import { MdOutlineShoppingCart } from 'react-icons/md';

const Header = ({ onCartClick }) => {
  const { cart } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className='bg-slate-800 sticky top-0 z-50'>
      <div className='border-b border-slate-700'>
        <div className="container mx-auto px-4 py-3">
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm'>
            <div className='flex gap-2 items-center' >
              <CiLocationOn color='#ff6900' size={20} />
              <p className='text-slate-300'>AV. Principal 123, Ciudad</p>
            </div>

            <div className='flex gap-2 items-center' >
              <PiPhone color='#ff6900' size={20} />
              <p className='text-slate-300'>+ (3456) 445977</p>
            </div>

            <div className='flex gap-2 items-center' >
              <BsClock color='#ff6900' size={20} />
              <p className='text-slate-300'>Lun-Sab: 9:00 - 20:00</p>
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-between py-5 mx-10'>
        <Link to="/">
          <div className=''>
            <img src={logoTitle} className='w-25 h-15' alt="Sport Store Title" />
          </div>
        </Link>
        <div className='flex gap-5 m-2'>
          <div className='cursor-pointer'>
            <FaInstagram size={25} className='hover:text-[#ff6900] text-white transition-all duration-300' />
          </div>
          <div onClick={onCartClick} className='cursor-pointer'>
            <div className="relative">
              <MdOutlineShoppingCart size={25} className='hover:text-[#ff6900] text-white transition-all duration-300' />
              {
                totalItems !== 0 &&
                <p className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </p>
              }
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;