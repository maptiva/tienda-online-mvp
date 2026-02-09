/**
 * Lista de emails autorizados para acceder al CRM y funciones de Super Admin.
 * Los emails reales deben configurarse en variables de entorno para producción.
 */
export const SUPER_ADMIN_EMAILS = [
    'admin@example.com'
];

/**
 * Función para verificar si un usuario tiene permisos de Super Admin.
 * @param {object} user - El objeto usuario de Supabase Auth.
 * @returns {boolean}
 */
export const isSuperAdmin = (user) => {
    if (!user || !user.email) return false;
    return SUPER_ADMIN_EMAILS.includes(user.email);
};
