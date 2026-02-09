import React from 'react';

/**
 * Error Boundary global que captura errores de renderizado en React.
 * Evita que un error en un componente hijo rompa toda la aplicación.
 * 
 * Uso: Envolver la app o secciones críticas.
 * <ErrorBoundary fallback={<MiComponenteDeError />}>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log del error para debugging (en producción se podría enviar a un servicio)
    console.error('[ErrorBoundary] Error capturado:', error);
    console.error('[ErrorBoundary] Component Stack:', errorInfo?.componentStack);

    // Hook para reportar errores (extensible a Sentry, LogRocket, etc.)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Si se provee un fallback personalizado, usarlo
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
          : this.props.fallback;
      }

      // Fallback por defecto
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>
            Algo salió mal
          </h2>
          <p style={{ color: '#666', maxWidth: '400px', marginBottom: '1.5rem' }}>
            Ocurrió un error inesperado. Podés intentar recargar la página o volver al inicio.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
              }}
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
              }}
            >
              Ir al inicio
            </button>
          </div>

          {/* Mostrar detalles del error solo en desarrollo */}
          {import.meta.env.DEV && this.state.error && (
            <details style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: '#fef2f2',
              borderRadius: '0.5rem',
              maxWidth: '600px',
              width: '100%',
              textAlign: 'left',
            }}>
              <summary style={{ cursor: 'pointer', color: '#991b1b', fontWeight: '500' }}>
                🔍 Detalles del error (solo en desarrollo)
              </summary>
              <pre style={{
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: '#7f1d1d',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
