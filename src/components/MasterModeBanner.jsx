import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserShield, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MasterModeBanner = () => {
    const { impersonatedUser, setImpersonatedUser, isMaster } = useAuth();
    const navigate = useNavigate();

    if (!isMaster || !impersonatedUser) return null;

    const handleStopImpersonation = () => {
        setImpersonatedUser(null);
        navigate('/admin');
    };

    return (
        <div className="bg-amber-500 text-white px-4 py-2 flex justify-between items-center shadow-md animate-pulse-subtle sticky top-0 z-[100]">
            <div className="flex items-center gap-2">
                <FaUserShield className="text-xl" />
                <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-2">
                    <span className="font-black uppercase tracking-tighter text-xs md:text-sm">MODO GESTIÓN MAESTRA ACTIVO</span>
                    <span className="hidden md:inline opacity-50">|</span>
                    <span className="text-[10px] md:text-xs font-bold bg-white/20 px-2 py-0.5 rounded">ID: {impersonatedUser}</span>
                </div>
            </div>

            <button
                onClick={handleStopImpersonation}
                className="bg-white text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all flex items-center gap-1 shadow-sm active:scale-95"
            >
                <FaTimes /> Detener Gestión
            </button>

            <style>{`
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.92; }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default MasterModeBanner;
