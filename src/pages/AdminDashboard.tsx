import React, { useState, useEffect } from 'react';
import { AsideBar } from '../components/dashboard/AsideBar';


function AdminDashboard({ children }) {
  return (
    <div className='flex gap-5 h-[calc(100vh-213px)]'>
      <AsideBar />
      {children}
    </div >
  );
}

export default AdminDashboard;
