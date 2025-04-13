import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verify environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Check your .env file');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);

// Client type definition
export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  client_type: 'buyer' | 'seller';
  locations: string[];
  price_min: number | null;
  price_max: number | null;
  agent_id: string | null;
  agent_name: string | null;
  tags: string[];
}

// Junction table type
export interface ClientOffer {
  id: string;
  client_id: string;
  offer_id: string;
  created_at: string;
  user_id: string;
  notes?: string | null;
  status: string;
}

// Client service functions
export const clientsService = {
  async getClients(type?: 'buyer' | 'seller'): Promise<Client[]> {
    try {
      let query = supabase
        .from('clients')
        .select('*');
      
      if (type) {
        query = query.eq('client_type', type);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
      return [];
    }
  },

  async getClient(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching client:', error);
      toast.error('Failed to load client details');
      return null;
    }
  },

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Client added successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error('Failed to add client');
      throw error;
    }
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Client updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
      throw error;
    }
  },

  async deleteClient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Client deleted successfully');
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
      throw error;
    }
  },

  async getClientOffers(clientId: string): Promise<ClientOffer[]> {
    try {
      const { data, error } = await supabase
        .from('client_offers')
        .select('*')
        .eq('client_id', clientId);
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching client offers:', error);
      return [];
    }
  },

  async addClientToOffer(clientId: string, offerId: string): Promise<ClientOffer> {
    try {
      const { data, error } = await supabase
        .from('client_offers')
        .insert([{
          client_id: clientId,
          offer_id: offerId,
          status: 'active'
        }])
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Client assigned to offer');
      return data;
    } catch (error: any) {
      console.error('Error adding client to offer:', error);
      toast.error('Failed to assign client to offer');
      throw error;
    }
  },

  async removeClientFromOffer(clientId: string, offerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('client_offers')
        .delete()
        .eq('client_id', clientId)
        .eq('offer_id', offerId);
      
      if (error) throw error;
      toast.success('Client removed from offer');
    } catch (error: any) {
      console.error('Error removing client from offer:', error);
      toast.error('Failed to remove client from offer');
      throw error;
    }
  },

  async getClientsForOffer(offerId: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('client_offers')
        .select(`
          client_id,
          clients!inner(*)
        `)
        .eq('offer_id', offerId);
      
      if (error) throw error;
      return data?.map(item => item.clients) || [];
    } catch (error: any) {
      console.error('Error fetching clients for offer:', error);
      return [];
    }
  }
};

// Export types and services
export default clientsService;

export { clientsService }