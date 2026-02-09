/**
 * Lista de emails autorizados para acceder al CRM y funciones de Super Admin.
 * Configurar en variable de entorno VITE_SUPER_ADMIN_EMAILS (separados por coma)
 * Ejemplo: VITE_SUPER_ADMIN_EMAILS="admin1@gmail.com,admin2@gmail.com"
 */
const getSuperAdminEmails = () => {
    const envEmails = import.meta.env.VITE_SUPER_ADMIN_EMAILS;
    if (envEmails) {
        return envEmails.split(',').map(email => email.trim());
    }
    // Emails por defecto para desarrollo
    return [
        'maptiva.sig.app@gmail.com'
    ];
};

export const SUPER_ADMIN_EMAILS = getSuperAdminEmails();

/**
 * Función para verificar si un usuario tiene permisos de Super Admin.
 * @param {object} user - El objeto usuario de Supabase Auth.
 * @returns {boolean}
 */
export const isSuperAdmin = (user) => {
    if (!user || !user.email) return false;
    return SUPER_ADMIN_EMAILS.includes(user.email);
};
