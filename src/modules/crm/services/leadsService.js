import { supabase } from '../../../services/supabase';

export const leadsService = {
  // Obtener todos los leads
  async fetchLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Crear lead
  async createLead(leadData) {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar lead
  async updateLead(id, updates) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar lead
  async deleteLead(id) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Convertir lead a cliente
  async convertToClient(leadId, clientData) {
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
  async importLeads(leadsArray) {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadsArray)
      .select();

    if (error) throw error;
    return data;
  }
};
