import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AsideBar } from './dashboard/AsideBar';
import './AdminLayout.css';

const AdminLayout = () => {
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

  return (
    <div className="admin-wrapper">
      <AsideBar />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;