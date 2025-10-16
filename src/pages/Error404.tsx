import React from 'react'

export const Error404 = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
            <h1 style={{ fontSize: '4rem', color: '#E57373' }}>404</h1>
            <h2>Página no encontrada</h2>
            <p>La URL que has ingresado no existe o ha sido movida.</p>
            <a href="/" style={{ color: '#1976D2', textDecoration: 'underline' }}>Volver al inicio</a>
        </div>
    )
}
