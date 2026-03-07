import { useState, useCallback } from 'react';
import { supabase } from '../../services/supabase';

const ITEMS_PER_PAGE = 20; // Configurable: items por página

export const useClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    const fetchClients = useCallback(async (showArchived = false, page = 1) => {
        setLoading(true);
        try {
            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            // Query con paginación y count exacto
            let query = supabase
                .from('clients')
                .select('*', { count: 'exact' });

            if (!showArchived) {
                query = query.eq('status', 'active');
            } else {
                query = query.eq('status', 'archived');
            }

            const { data: clientsData, error: clientsError, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (clientsError) {
                console.error('❌ Error trayendo clientes:', clientsError);
                throw clientsError;
            }

            // Solo traer tiendas y pagos para los clientes de esta página
            const clientIds = clientsData.map(c => c.id);

            // Traer tiendas relacionadas (optimizado con filtro IN)
            const { data: storesData, error: storesError } = await supabase
                .from('stores')
                .select(`
                    id,
                    store_name,
                    store_slug,
                    is_demo,
                    client_id,
                    user_id,
                    enable_stock,
                    subscriptions (
                        id,
                        plan_type,
                        status,
                        amount
                    )
                `)
                .in('client_id', clientIds);

            if (storesError) {
                console.error('❌ Error trayendo tiendas:', storesError);
                throw storesError;
            }

            // Traer pagos relacionados (optimizado con filtro IN y limit)
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('client_id, created_at, notes, amount')
                .in('client_id', clientIds)
                .order('created_at', { ascending: false })
                .limit(100); // Limitar pagos por cliente

            if (paymentsError) {
                console.error('❌ Error trayendo pagos:', paymentsError);
                throw paymentsError;
            }

            // JOIN manual optimizado
            const clientsWithStores = clientsData.map(client => ({
                ...client,
                stores: storesData?.filter(store => store.client_id === client.id) || [],
                payments: paymentsData?.filter(p => p.client_id === client.id) || []
            }));

            setClients(clientsWithStores);

            // Actualizar paginación
            const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);
            setPagination({
                page,
                totalPages,
                totalItems: count || 0,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            });
        } catch (err) {
            console.error('Error fetching clients:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const getRealStores = async () => {
        try {
            const { data, error: storeError } = await supabase
                .from('stores')
                .select('id, store_name, user_id, client_id, enable_stock')
                .eq('is_demo', false)

            if (storeError) throw storeError;
            return data || [];
        } catch (err) {
            console.error('Error fetching real stores:', err);
            return [];
        }
    };

    const createClient = async (clientData, storeId = null) => {
        setLoading(true);
        try {
            // 1. Crear el cliente
            const { data: newClient, error: clientError } = await supabase
                .from('clients')
                .insert([{
                    name: clientData.name,
                    contact_email: clientData.contact_email,
                    contact_phone: clientData.contact_phone,
                    billing_info: clientData.billing_info,
                    notes: clientData.notes
                }])
                .select()
                .single();

            if (clientError) throw clientError;

            // 2. Si se seleccionó una tienda, vincularla
            if (storeId && newClient) {
                const storeIdNum = parseInt(storeId, 10);

                const { error: storeError } = await supabase
                    .from('stores')
                    .update({
                        client_id: newClient.id,
                        enable_stock: clientData.enable_stock === true
                    })
                    .eq('id', storeIdNum);

                if (storeError) throw storeError;
            }

            await fetchClients();
            return { success: true, data: newClient };
        } catch (err) {
            console.error('Error creating client:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateClient = async (id, clientData, storeId = null) => {
        setLoading(true);
        try {
            // 1. Actualizar el cliente
            const { error: clientError } = await supabase
                .from('clients')
                .update({
                    name: clientData.name,
                    contact_email: clientData.contact_email,
                    contact_phone: clientData.contact_phone,
                    billing_info: clientData.billing_info,
                    notes: clientData.notes
                })
                .eq('id', id);

            if (clientError) throw clientError;

            // 2. Gestionar vinculación de tienda
            if (storeId) {
                const storeIdNum = parseInt(storeId, 10);

                const { error: storeError } = await supabase
                    .from('stores')
                    .update({
                        client_id: id,
                        enable_stock: clientData.enable_stock === true
                    })
                    .eq('id', storeIdNum);

                if (storeError) throw storeError;
            }

            await fetchClients();
            return { success: true };
        } catch (err) {
            console.error('Error updating client:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const reactivateClient = async (id) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('clients')
                .update({ status: 'active' })
                .eq('id', id);

            if (error) throw error;

            await fetchClients();
            return { success: true };
        } catch (err) {
            console.error('Error reactivating client:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const archiveClient = async (id) => {
        setLoading(true);
        try {
            // 1. Desvincular tiendas (quedan libres para otros clientes)
            await supabase.from('stores').update({ client_id: null }).eq('client_id', id);

            // 2. Marcar como archivado (Soft Delete) para preservar historial contable
            const { error } = await supabase
                .from('clients')
                .update({ status: 'archived' })
                .eq('id', id);

            if (error) throw error;

            await fetchClients();
            return { success: true };
        } catch (err) {
            console.error('Error archiving client:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Funciones de navegación de paginación
    const goToPage = useCallback((pageNum) => {
        if (pageNum >= 1 && pageNum <= pagination.totalPages) {
            fetchClients(false, pageNum);
        }
    }, [fetchClients, pagination.totalPages]);

    const nextPage = useCallback(() => {
        if (pagination.hasNextPage) {
            fetchClients(false, pagination.page + 1);
        }
    }, [fetchClients, pagination.hasNextPage, pagination.page]);

    const prevPage = useCallback(() => {
        if (pagination.hasPrevPage) {
            fetchClients(false, pagination.page - 1);
        }
    }, [fetchClients, pagination.hasPrevPage, pagination.page]);

    return {
        clients,
        loading,
        error,
        pagination,
        fetchClients,
        goToPage,
        nextPage,
        prevPage,
        getRealStores,
        createClient,
        updateClient,
        archiveClient,
        reactivateClient
    };
};
