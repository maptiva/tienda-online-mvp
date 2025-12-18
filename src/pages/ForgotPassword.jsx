import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';
import styles from './Login.module.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Construir URL de redirección absoluta. 
            let baseUrl = window.location.origin;

            // Si estamos en Vercel o en el dominio de producción, preferir siempre el dominio principal para la marca
            if (baseUrl.includes('vercel.app') || baseUrl.includes('clicando.com.ar')) {
                baseUrl = 'https://clicando.com.ar';
            }

            const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
            const redirectUrl = `${baseUrl}${basePath}/reset-password`;

            console.log('Solicitando reset con redirección a:', redirectUrl);

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) throw error;

            await Swal.fire({
                icon: 'success',
                title: '¡Email enviado!',
                text: 'Revisa tu correo para restablecer tu contraseña',
                timer: 3000,
                showConfirmButton: false
            });

            setEmail('');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al enviar el email'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginBox}>
                <h1>Recuperar Contraseña</h1>
                <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
                    Ingresa tu email y te enviaremos un link para restablecer tu contraseña
                </p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="tu@email.com"
                            className="text-[#666]"
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.loginButton}
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Email'}
                    </button>
                </form>

                <Link
                    to="/login"
                    style={{
                        display: 'block',
                        textAlign: 'center',
                        marginTop: '1rem',
                        color: '#ff6900',
                        textDecoration: 'none',
                        fontSize: '0.9rem'
                    }}
                >
                    Volver al Login
                </Link>
            </div>
        </div>
    );
}

export default ForgotPassword;
