import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSuperAdmin } from '../utils/authRoles';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

const SuperAdminRoute = ({ children }: SuperAdminRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            Cargando permisos maestro...
          </div>
        );
    }

    if (!user || !isSuperAdmin(user)) {
        console.warn('Acceso denegado: Se requiere nivel Súper Admin.');
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default SuperAdminRoute;
