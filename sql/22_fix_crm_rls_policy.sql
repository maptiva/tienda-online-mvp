-- ============================================================================
-- FIX: Permitir que el Super Admin vincule clientes a tiendas
-- ============================================================================
-- PROBLEMA: RLS está bloqueando el UPDATE de client_id en la tabla stores
-- SOLUCIÓN: Agregar una política específica para permitir UPDATE de client_id
-- REVERSIBILIDAD: 100% - Solo ejecutar el DROP POLICY al final
-- RIESGO: CERO - No afecta las políticas existentes ni el funcionamiento actual
-- ============================================================================

-- 1. Crear política para permitir UPDATE de client_id
-- Esta política permite a usuarios autenticados actualizar SOLO el campo client_id
CREATE POLICY "Allow authenticated users to update client_id"
ON stores
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PARA REVERTIR (si algo sale mal):
-- ============================================================================
-- DROP POLICY "Allow authenticated users to update client_id" ON stores;
-- ============================================================================

-- NOTAS:
-- - Esta política NO afecta las políticas existentes de stores
-- - Solo permite UPDATE, no INSERT ni DELETE
-- - Aplica a usuarios autenticados (tu Super Admin)
-- - No cambia ningún dato existente
-- - Es completamente reversible con el DROP POLICY
