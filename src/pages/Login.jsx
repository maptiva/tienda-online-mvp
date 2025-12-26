import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import styles from './Login.module.css';
import logoClicando from '../assets/logo-clicando.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await signIn({ email, password });
      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'Credenciales inválidas' : 'Error al iniciar sesión.');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError('Error al iniciar sesión.');
      console.error(err);
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
          <h1 className={styles.welcomeTitle}>Bienvenido de nuevo</h1>
          <p className={styles.welcomeSubtitle}>Ingresa a tu panel de administración</p>

          {error && (
            <div className={styles.errorAlert}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Contraseña</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  placeholder="••••••••"
                  required
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

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <Link to="/forgot-password" className={styles.forgotLink}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
