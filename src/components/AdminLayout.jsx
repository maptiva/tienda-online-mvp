import React from 'react';
import { Outlet } from 'react-router-dom';
import { AsideBar } from './dashboard/AsideBar';
import './AdminLayout.css';

const AdminLayout = () => {
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