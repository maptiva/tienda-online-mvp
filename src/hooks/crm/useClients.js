import { useState, useCallback } from 'react';
import { supabase } from '../../services/supabase';

export const useClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchClients = useCallback(async (showArchived = false) => {
        setLoading(true);
        try {
            // Primero traer los clientes (filtrando por estado)
            let query = supabase.from('clients').select('*');

            if (!showArchived) {
                query = query.eq('status', 'active');
            } else {
                query = query.eq('status', 'archived');
            }

            const { data: clientsData, error: clientsError } = await query.order('created_at', { ascending: false });

            if (clientsError) {
                console.error('❌ Error trayendo clientes:', clientsError);
                throw clientsError;
            }

            // Luego traer todas las tiendas con sus suscripciones
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
                `);

            if (storesError) {
                console.error('❌ Error trayendo tiendas:', storesError);
                throw storesError;
            }

            // Luego traer todos los pagos para calcular estados comerciales
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('client_id, created_at, notes, amount')
                .order('created_at', { ascending: false });

            if (paymentsError) {
                console.error('❌ Error trayendo pagos:', paymentsError);
                throw paymentsError;
            }

            // Hacer el JOIN manualmente en JavaScript
            const clientsWithStores = clientsData.map(client => ({
                ...client,
                stores: storesData.filter(store => store.client_id === client.id),
                payments: paymentsData.filter(p => p.client_id === client.id)
            }));

            setClients(clientsWithStores);
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

    return {
        clients,
        loading,
        error,
        fetchClients,
        getRealStores,
        createClient,
        updateClient,
        archiveClient,
        reactivateClient
    };
};
