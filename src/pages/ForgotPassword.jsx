import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './Login.module.css';
import logoClicando from '../assets/logo-clicando.png';

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
            // Si estamos en Vercel o en el dominio de producción, preferir siempre el dominio principal
            if (baseUrl.includes('vercel.app') || baseUrl.includes('clicando.com.ar')) {
                baseUrl = 'https://clicando.com.ar';
            }

            const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
            const redirectUrl = `${baseUrl}${basePath}/reset-password`;

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
            {/* Panel de Branding - Izquierda */}
            <div className={styles.brandingPanel}>
                <Link to="/" className={styles.backButton}>
                    <FaArrowLeft /> Volver a Clicando
                </Link>
                <div className={styles.brandingContent}>
                    <img src={logoClicando} alt="Clicando" className={styles.logo} />
                    <h2 className={styles.tagline}>Tu catálogo digital con WhatsApp</h2>
                    <p className={styles.subtitle}>Conecta con tus clientes de forma simple y efectiva</p>
                </div>
            </div>

            {/* Panel de Formulario - Derecha */}
            <div className={styles.formPanel}>
                <div className={styles.formContainer}>
                    <h1 className={styles.welcomeTitle}>Recuperar Contraseña</h1>
                    <p className={styles.welcomeSubtitle}>
                        Ingresa tu email y te enviaremos un link para restablecer tu contraseña
                    </p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                placeholder="tu@email.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Email'
                            )}
                        </button>
                    </form>

                    <Link to="/login" className={styles.forgotLink}>
                        Volver al Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
