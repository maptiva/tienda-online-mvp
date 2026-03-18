import { supabase } from '../../../services/supabase';
import { type Lead } from './leads.schema';

/**
 * Datos para crear un lead
 */
export interface CreateLeadData {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    store_id?: string;
    assigned_to?: string;
}

/**
 * Datos para actualizar un lead
 */
export interface UpdateLeadData extends Partial<CreateLeadData> {
    status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
    notes?: string;
}

/**
 * Datos de cliente para conversión de lead
 */
export interface ClientData {
    name: string;
    email?: string;
    phone?: string;
    store_id?: string;
}

export const leadsService = {
    // Obtener todos los leads
    async fetchLeads(): Promise<Lead[]> {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Lead[];
    },

    // Crear lead
    async createLead(leadData: CreateLeadData): Promise<Lead> {
        const { data, error } = await supabase
            .from('leads')
            .insert([leadData])
            .select()
            .single();

        if (error) throw error;
        return data as Lead;
    },

    // Actualizar lead
    async updateLead(id: string, updates: UpdateLeadData): Promise<Lead> {
        const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Lead;
    },

    // Eliminar lead
    async deleteLead(id: string): Promise<void> {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Convertir lead a cliente
    async convertToClient(leadId: string, clientData: ClientData): Promise<unknown> {
        // 1. Crear cliente
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert([clientData])
            .select()
            .single();

        if (clientError) throw clientError;

        // 2. Actualizar lead a CONVERTED
        await this.updateLead(leadId, { status: 'CONVERTED' });

        return client;
    },

    // Importar leads masivamente
    async importLeads(leadsArray: CreateLeadData[]): Promise<Lead[]> {
        const { data, error } = await supabase
            .from('leads')
            .insert(leadsArray)
            .select();

        if (error) throw error;
        return data as Lead[];
    }
};
