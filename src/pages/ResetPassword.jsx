import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import styles from './Login.module.css';
import logoClicando from '../assets/logo-clicando.png';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            // Damos un pequeño respiro para que Supabase procese el hash de la URL
            await new Promise(resolve => setTimeout(resolve, 800));

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const errorDesc = hashParams.get('error_description');

                Swal.fire({
                    icon: 'error',
                    title: 'Enlace expirado',
                    text: errorDesc?.replace(/\+/g, ' ') || 'El link de recuperación ha expirado. Por favor, solicita uno nuevo.'
                });
                navigate('/login');
            }
        };

        checkSession();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden'
            });
            return;
        }

        // Validar longitud mínima
        if (password.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La contraseña debe tener al menos 6 caracteres'
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            await Swal.fire({
                icon: 'success',
                title: '¡Contraseña actualizada!',
                text: 'Tu contraseña ha sido cambiada exitosamente',
                timer: 2000,
                showConfirmButton: false
            });

            navigate('/login');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al actualizar la contraseña'
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
                    <h1 className={styles.welcomeTitle}>Nueva Contraseña</h1>
                    <p className={styles.welcomeSubtitle}>
                        Ingresa tu nueva contraseña para tu cuenta
                    </p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.label}>Nueva Contraseña</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    minLength={6}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.togglePassword}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    disabled={loading}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>Confirmar Contraseña</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={styles.input}
                                placeholder="Repite la contraseña"
                                required
                                minLength={6}
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
                                    Actualizando...
                                </>
                            ) : (
                                'Cambiar Contraseña'
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

export default ResetPassword;
