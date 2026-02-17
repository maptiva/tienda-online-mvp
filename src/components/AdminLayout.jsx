import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AsideBar } from './dashboard/AsideBar';
import MasterModeBanner from './MasterModeBanner';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Forzar tema claro en el panel de admin
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      // Restaurar el tema cuando se salga del admin
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  // Cerrar menú al cambiar de ruta (útil para móvil)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [window.location.pathname]);

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-root-container">
      <MasterModeBanner />
      <div className="admin-wrapper">
        {/* Botón Hamburguesa (solo visible en móvil) */}
        <button
          className={`hamburger-button ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Overlay oscuro (solo visible cuando el menú está abierto en móvil) */}
        <div
          className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        />

        {/* Sidebar */}
        <AsideBar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

        {/* Contenido principal */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;