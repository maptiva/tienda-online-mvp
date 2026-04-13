import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const getStorageKey = (pathname: string): string => `scroll_state_${pathname}`;

const ScrollToTop: React.FC = () => {
    const { pathname, key } = useLocation();
    const navType = useNavigationType();
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Guardar scroll antes de abandonar la página
        if (window.scrollY > 0) {
            const key = getStorageKey(pathname);
            sessionStorage.setItem(key, JSON.stringify({
                scrollX: window.scrollX,
                scrollY: window.scrollY
            }));
        }
    }, [key, pathname]);

    useEffect(() => {
        if (isInitialMount.current) {
            return;
        }

        // Solo restaurar scroll si es navegación POP (atrás/adelante)
        // y solo si NO hay datos guardados (ScrollToTop maneja el restore)
        // Este effect es solo para limpiar cuando hay navegación forward
        if (navType !== 'POP') {
            const key = getStorageKey(pathname);
            sessionStorage.removeItem(key);
            window.scrollTo(0, 0);
        }
    }, [key, pathname, navType]);

    return null;
};

export default ScrollToTop;