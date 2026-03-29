import React, { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();
    const navType = useNavigationType();

    useEffect(() => {
        // "POP" significa que el usuario usó el botón Atrás/Adelante del navegador.
        if (navType !== 'POP') {
            window.scrollTo(0, 0);
        }
    }, [pathname, navType]);

    return null;
};

export default ScrollToTop;
