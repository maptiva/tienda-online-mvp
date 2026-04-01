import { useState, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { clientSchema, createClientSchema, updateClientSchema } from '../../schemas/client.schema';
import { safeValidate } from '../../utils/zodHelpers';
import type { Client } from '../../schemas/client.schema';

const ITEMS_PER_PAGE = 20; // Configurable: items por página

export const useClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<{
        page: number;
        totalPages: number;
        totalItems: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    }>({
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

            const { data: rawClientsData, error: clientsError, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (clientsError) {
                console.error('❌ Error trayendo clientes:', clientsError);
                throw clientsError;
            }

            // Validar los datos de clientes con Zod
            const validatedClients: Client[] = [];
            const clientErrors: string[] = [];

            (rawClientsData || []).forEach((rawClient) => {
                const { data: validatedClient, error: validationError } = safeValidate(clientSchema, rawClient);
                if (validationError) {
                    clientErrors.push(`[${rawClient.name || 'unknown'}]: ${validationError.issues.map(e => e.message).join(', ')}`);
                } else if (validatedClient) {
                    validatedClients.push(validatedClient);
                }
            });

            if (clientErrors.length > 0) {
                console.warn("Validation errors for clients:", clientErrors);
            }

            // Solo traer tiendas y pagos para los clientes de esta página
            const clientIds = validatedClients.map(c => c.id);

            // Traer tiendas relacionadas (optimizado con filtro IN)
            const { data: rawStoresData, error: storesError } = await supabase
                .from('stores')
                .select(`
                    id,
                    store_name,
                    store_slug,
                    is_demo,
                    client_id,
                    user_id,
                    enable_stock,
                    payment_exempt,
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
                .limit(100);

            if (paymentsError) {
                console.error('❌ Error trayendo pagos:', paymentsError);
                throw paymentsError;
            }

            // JOIN manual optimizado
            const clientsWithStores = validatedClients.map(client => ({
                ...client,
                stores: rawStoresData?.filter(store => store.client_id === client.id) || [],
                payments: paymentsData?.filter((p: any) => p.client_id === client.id) || []
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
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const getRealStores = async () => {
        try {
            const { data: rawStores, error: storeError } = await supabase
                .from('stores')
                .select('id, store_name, user_id, client_id, enable_stock')
                .eq('is_demo', false);

            if (storeError) throw storeError;
            return rawStores || [];
        } catch (err) {
            console.error('Error fetching real stores:', err);
            return [];
        }
    };

    const createClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>, storeId: string | null = null) => {
        setLoading(true);
        try {
            // Validar datos de entrada con Zod
            const { data: validatedClientData, error: validationError } = safeValidate(createClientSchema, clientData);
            if (validationError || !validatedClientData) {
                throw new Error(`Datos de cliente inválidos: ${validationError?.issues.map(e => e.message).join(', ') || 'Error desconocido'}`);
            }

            // 1. Crear el cliente
            const { data: newClient, error: clientError } = await supabase
                .from('clients')
                .insert([{
                    name: validatedClientData.name,
                    contact_email: validatedClientData.contact_email,
                    contact_phone: validatedClientData.contact_phone,
                    billing_info: validatedClientData.billing_info,
                    notes: validatedClientData.notes
                }])
                .select()
                .single();

            if (clientError) throw clientError;

            // 2. Si se seleccionó una tienda, vincularla
            if (storeId && newClient) {
                const storeIdNum = parseInt(storeId, 10);

                await supabase
                    .from('stores')
                    .update({
                        client_id: newClient.id,
                        enable_stock: validatedClientData.enable_stock === true,
                        payment_exempt: validatedClientData.payment_exempt === true
                    })
                    .eq('id', storeIdNum);
            }

            await fetchClients();
            return { success: true, data: newClient };
        } catch (err) {
            console.error('Error creating client:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        } finally {
            setLoading(false);
        }
    };

    const updateClient = async (id: string, clientData: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>, storeId: string | null = null) => {
        setLoading(true);
        try {
            // Validar datos de entrada con Zod
            const { data: validatedClientData, error: validationError } = safeValidate(updateClientSchema, clientData);
            if (validationError || !validatedClientData) {
                throw new Error(`Datos de cliente inválidos para actualización: ${validationError?.issues.map(e => e.message).join(', ') || 'Error desconocido'}`);
            }

            // 1. Actualizar el cliente
            const { error: clientError } = await supabase
                .from('clients')
                .update({
                    name: validatedClientData.name,
                    contact_email: validatedClientData.contact_email,
                    contact_phone: validatedClientData.contact_phone,
                    billing_info: validatedClientData.billing_info,
                    notes: validatedClientData.notes
                })
                .eq('id', id);

            if (clientError) throw clientError;

            // 2. Gestionar vinculación de tienda
            if (storeId) {
                const storeIdNum = parseInt(storeId, 10);

                await supabase
                    .from('stores')
                    .update({
                        client_id: id,
                        enable_stock: validatedClientData.enable_stock === true,
                        payment_exempt: validatedClientData.payment_exempt === true
                    })
                    .eq('id', storeIdNum);
            }

            await fetchClients();
            return { success: true };
        } catch (err) {
            console.error('Error updating client:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        } finally {
            setLoading(false);
        }
    };

    const reactivateClient = async (id: string | number) => {
        setLoading(true);
        try {
            const { error } = await supabase.from('clients').update({ status: 'active' }).eq('id', id);
            if (error) throw error;
            await fetchClients();
            return { success: true };
        } catch (err) {
            console.error('Error reactivating client:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        } finally {
            setLoading(false);
        }
    };

    const archiveClient = async (id: string | number) => {
        setLoading(true);
        try {
            await supabase.from('stores').update({ client_id: null }).eq('client_id', id);
            const { error } = await supabase.from('clients').update({ status: 'archived' }).eq('id', id);
            if (error) throw error;
            await fetchClients();
            return { success: true };
        } catch (err) {
            console.error('Error archiving client:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        } finally {
            setLoading(false);
        }
    };

    const goToPage = useCallback((pageNum: number) => {
        if (pageNum >= 1 && pageNum <= pagination.totalPages) {
            fetchClients(false, pageNum);
        }
    }, [fetchClients, pagination.totalPages]);

    const nextPage = useCallback(() => {
        if (pagination.hasNextPage) fetchClients(false, pagination.page + 1);
    }, [fetchClients, pagination.hasNextPage, pagination.page]);

    const prevPage = useCallback(() => {
        if (pagination.hasPrevPage) fetchClients(false, pagination.page - 1);
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
