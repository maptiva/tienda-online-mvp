import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();
    const navType = useNavigationType();

    useEffect(() => {
        // "POP" significa que el usuario usó el botón Atrás/Adelante del navegador.
        // En ese caso, NO forzamos el scroll arriba, dejamos que el navegador restaure la posición.
        if (navType !== 'POP') {
            window.scrollTo(0, 0);
        }
    }, [pathname, navType]);

    return null;
}
