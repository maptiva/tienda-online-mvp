import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserShield, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MasterModeBanner = () => {
    const { impersonatedUser, setImpersonatedUser, isMaster } = useAuth();
    const navigate = useNavigate();

    const bannerRef = React.useRef(null);

    React.useEffect(() => {
        if (!impersonatedUser || !isMaster) {
            document.documentElement.style.setProperty('--master-banner-height', '0px');
            document.documentElement.classList.remove('has-master-banner');
            return;
        }

        const updateHeight = () => {
            if (bannerRef.current) {
                const height = bannerRef.current.offsetHeight;
                document.documentElement.style.setProperty('--master-banner-height', `${height}px`);
                document.documentElement.classList.add('has-master-banner');
            }
        };

        // Actualización inicial
        updateHeight();

        // Observer para cambios de tamaño (ej. al redimensionar ventana o cambio de contenido)
        const observer = new ResizeObserver(updateHeight);
        if (bannerRef.current) {
            observer.observe(bannerRef.current);
        }

        return () => {
            observer.disconnect();
            document.documentElement.style.setProperty('--master-banner-height', '0px');
            document.documentElement.classList.remove('has-master-banner');
        };
    }, [impersonatedUser, isMaster]);

    if (!isMaster || !impersonatedUser) return null;

    const handleStopImpersonation = () => {
        setImpersonatedUser(null);
        navigate('/admin');
    };

    return (
        <div
            ref={bannerRef}
            className="bg-amber-500 text-white px-4 py-2 flex justify-between items-center shadow-md animate-pulse-subtle relative z-[10000] w-full flex-shrink-0"
        >
            <div className="flex items-center gap-2">
                <FaUserShield className="text-xl" />
                <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-2">
                    <span className="font-black uppercase tracking-tighter text-xs md:text-sm">MODO GESTIÓN MAESTRA ACTIVO</span>
                    <span className="hidden md:inline opacity-50">|</span>
                    <span className="text-[10px] md:text-xs font-bold bg-white/20 px-2 py-0.5 rounded">🏪 {impersonatedUser.storeName}</span>
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
