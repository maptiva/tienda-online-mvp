-- ============================================
-- Migración: Automatización de Stock por Pedidos
-- Fecha: 01 de marzo de 2026
-- Descripción: Trigger para devolver stock cuando un pedido se cancela.
-- ============================================

-- 1. Función para manejar la devolución de stock
CREATE OR REPLACE FUNCTION handle_order_status_change_stock()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    v_user_id UUID;
BEGIN
    -- Solo actuar si el estado cambia a 'cancelled'
    -- Y si el estado anterior NO era 'cancelled' (evitar loops)
    IF (OLD.status IS DISTINCT FROM 'cancelled' AND NEW.status = 'cancelled') THEN
        
        -- Obtener el user_id del dueño de la tienda para los logs
        SELECT user_id INTO v_user_id 
        FROM stores 
        WHERE id = NEW.store_id;

        -- Iterar sobre los productos del pedido (JSONB items)
        -- Formato esperado: [{"product_id": 123, "quantity": 2, ...}]
        FOR item IN SELECT * FROM jsonb_to_recordset(NEW.items) AS x(product_id BIGINT, quantity INTEGER)
        LOOP
            -- 1. Incrementar el stock en la tabla inventory
            UPDATE inventory 
            SET quantity = quantity + item.quantity,
                updated_at = NOW()
            WHERE product_id = item.product_id 
            AND user_id = v_user_id;

            -- 2. Registrar el movimiento en inventory_logs
            INSERT INTO inventory_logs (
                product_id,
                user_id,
                movement_type,
                quantity_change,
                previous_quantity,
                new_quantity,
                reason,
                order_id
            ) 
            SELECT 
                item.product_id,
                v_user_id,
                'return',
                item.quantity,
                (SELECT quantity - item.quantity FROM inventory WHERE product_id = item.product_id AND user_id = v_user_id), -- Cantidad previa (antes del update)
                (SELECT quantity FROM inventory WHERE product_id = item.product_id AND user_id = v_user_id), -- Nueva cantidad (después del update)
                'Cancelación de pedido #' || NEW.id,
                NULL -- Referencia al pedido en el texto del motivo
            WHERE EXISTS (SELECT 1 FROM inventory WHERE product_id = item.product_id AND user_id = v_user_id);
            
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear el Trigger
DROP TRIGGER IF EXISTS tr_order_status_change_stock ON orders;
CREATE TRIGGER tr_order_status_change_stock
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION handle_order_status_change_stock();

COMMENT ON FUNCTION handle_order_status_change_stock IS 'Devuelve automáticamente el stock al inventario cuando un pedido es marcado como cancelado.';
