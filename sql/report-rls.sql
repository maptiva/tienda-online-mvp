-- =====================================================
-- REPORTE DE SALUD RLS (Row Level Security)
-- Objetivo: Identificar tablas sin protección multi-tenant.
-- =====================================================

SELECT 
    relname AS "Tabla",
    CASE 
        WHEN relrowsecurity = true THEN '✅ SECURE' 
        ELSE '❌ INSECURE' 
    END AS "Estado RLS",
    (SELECT count(*) FROM pg_policies WHERE tablename = relname) AS "Nro Políticas"
FROM 
    pg_class c
JOIN 
    pg_namespace n ON n.oid = c.relnamespace
WHERE 
    n.nspname = 'public' -- Solo schema público
    AND c.relkind = 'r'   -- Solo tablas reales
ORDER BY 
    relrowsecurity ASC, relname ASC;

-- =====================================================
-- FUNCIÓN RPC PARA AUTOMATIZACIÓN (Opcional)
-- Permite que el script check-rls.js obtenga estos datos.
-- =====================================================

CREATE OR REPLACE FUNCTION get_rls_status()
RETURNS TABLE (table_name text, rls_enabled boolean, policy_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con privilegios elevados para ver pg_class
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        relname::text,
        relrowsecurity,
        (SELECT count(*) FROM pg_policies WHERE tablename = relname)
    FROM 
        pg_class c
    JOIN 
        pg_namespace n ON n.oid = c.relnamespace
    WHERE 
        n.nspname = 'public'
        AND c.relkind = 'r';
END;
$$;
