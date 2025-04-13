import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for our data models
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
  type: 'buyer' | 'seller';
  locations: string[];
  price_min: number | null;
  price_max: number | null;
  agent_id: string | null;
  agent_name: string | null;
  tags: string[];
}

export interface ClientOffer {
  id: string;
  client_id: string;
  offer_id: string;
  created_at: string;
  user_id: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string | null;
}

// Database store interface
interface DatabaseStore {
  clients: Client[];
  clientOffers: ClientOffer[];
  users: User[];
  
  // Client operations
  getClients: (userId: string, type?: 'buyer' | 'seller') => Client[];
  getClient: (id: string) => Client | null;
  createClient: (userId: string, client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => Client | null;
  deleteClient: (id: string) => void;
  
  // ClientOffer operations
  getClientOffers: (clientId: string) => ClientOffer[];
  addClientToOffer: (userId: string, clientId: string, offerId: string) => ClientOffer;
  removeClientFromOffer: (clientId: string, offerId: string) => void;
  getClientsForOffer: (offerId: string) => Client[];
  
  // User operations
  getUser: (id: string) => User | null;
  createUser: (user: Omit<User, 'id' | 'created_at'>) => User;
}

// Create the persistent store
export const useDatabaseStore = create<DatabaseStore>()(
  persist(
    (set, get) => ({
      clients: [],
      clientOffers: [],
      users: [],
      
      // Client operations
      getClients: (userId, type) => {
        const clients = get().clients.filter(client => client.user_id === userId);
        if (type) {
          return clients.filter(client => client.type === type);
        }
        return clients;
      },
      
      getClient: (id) => {
        return get().clients.find(client => client.id === id) || null;
      },
      
      createClient: (userId, clientData) => {
        const newClient: Client = {
          id: uuidv4(),
          ...clientData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: userId,
          locations: clientData.locations || [],
          price_min: clientData.price_min || null,
          price_max: clientData.price_max || null,
          agent_id: null,
          agent_name: null,
          tags: clientData.tags || []
        };
        
        set(state => ({
          clients: [newClient, ...state.clients]
        }));
        
        return newClient;
      },
      
      updateClient: (id, updates) => {
        let updatedClient: Client | null = null;
        
        set(state => {
          const clients = state.clients.map(client => {
            if (client.id === id) {
              updatedClient = {
                ...client,
                ...updates,
                updated_at: new Date().toISOString()
              };
              return updatedClient;
            }
            return client;
          });
          
          return { clients };
        });
        
        return updatedClient;
      },
      
      deleteClient: (id) => {
        set(state => ({
          clients: state.clients.filter(client => client.id !== id),
          clientOffers: state.clientOffers.filter(offer => offer.client_id !== id)
        }));
      },
      
      // ClientOffer operations
      getClientOffers: (clientId) => {
        return get().clientOffers.filter(offer => offer.client_id === clientId);
      },
      
      addClientToOffer: (userId, clientId, offerId) => {
        const newClientOffer: ClientOffer = {
          id: uuidv4(),
          client_id: clientId,
          offer_id: offerId,
          created_at: new Date().toISOString(),
          user_id: userId
        };
        
        set(state => ({
          clientOffers: [...state.clientOffers, newClientOffer]
        }));
        
        return newClientOffer;
      },
      
      removeClientFromOffer: (clientId, offerId) => {
        set(state => ({
          clientOffers: state.clientOffers.filter(
            offer => !(offer.client_id === clientId && offer.offer_id === offerId)
          )
        }));
      },
      
      getClientsForOffer: (offerId) => {
        const clientIds = get().clientOffers
          .filter(offer => offer.offer_id === offerId)
          .map(offer => offer.client_id);
        
        return get().clients.filter(client => clientIds.includes(client.id));
      },
      
      // User operations
      getUser: (id) => {
        return get().users.find(user => user.id === id) || null;
      },
      
      createUser: (userData) => {
        const newUser: User = {
          id: uuidv4(),
          ...userData,
          created_at: new Date().toISOString(),
          last_login: null
        };
        
        set(state => ({
          users: [...state.users, newUser]
        }));
        
        return newUser;
      }
    }),
    {
      name: 'estate-academy-db',
    }
  )
);

// Client service with a similar API to what you'd use with Supabase
export const clientsService = {
  async getClients(type?: 'buyer' | 'seller'): Promise<Client[]> {
    // In a real implementation, you'd get the current user ID from auth
    const userId = localStorage.getItem('currentUserId') || 'default-user';
    return useDatabaseStore.getState().getClients(userId, type);
  },

  async getClient(id: string): Promise<Client | null> {
    return useDatabaseStore.getState().getClient(id);
  },

  async createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Client> {
    const userId = localStorage.getItem('currentUserId') || 'default-user';
    return useDatabaseStore.getState().createClient(userId, client);
  },

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    const updated = useDatabaseStore.getState().updateClient(id, client);
    if (!updated) {
      throw new Error('Client not found');
    }
    return updated;
  },

  async deleteClient(id: string): Promise<void> {
    useDatabaseStore.getState().deleteClient(id);
  },

  async getClientOffers(clientId: string): Promise<ClientOffer[]> {
    return useDatabaseStore.getState().getClientOffers(clientId);
  },

  async addClientToOffer(clientId: string, offerId: string): Promise<ClientOffer> {
    const userId = localStorage.getItem('currentUserId') || 'default-user';
    return useDatabaseStore.getState().addClientToOffer(userId, clientId, offerId);
  },

  async removeClientFromOffer(clientId: string, offerId: string): Promise<void> {
    useDatabaseStore.getState().removeClientFromOffer(clientId, offerId);
  },

  async getClientsForOffer(offerId: string): Promise<Client[]> {
    return useDatabaseStore.getState().getClientsForOffer(offerId);
  }
};

// Initialize with some mock data
export const initializeMockData = () => {
  const { clients, clientOffers } = useDatabaseStore.getState();
  
  if (clients.length === 0) {
    const userId = 'default-user';
    localStorage.setItem('currentUserId', userId);
    
    // Add some sample clients
    const client1 = clientsService.createClient({
      first_name: 'Jan',
      last_name: 'Kowalski',
      email: 'jan.kowalski@example.com',
      phone: '+48 501 234 567',
      notes: 'Szuka mieszkania na Mokotowie',
      type: 'buyer',
      locations: ['mokotow'],
      price_min: 500000,
      price_max: 800000,
      agent_id: null,
      agent_name: null,
      tags: ['pilne', 'gotówka']
    });
    
    const client2 = clientsService.createClient({
      first_name: 'Anna',
      last_name: 'Nowak',
      email: 'anna.nowak@example.com',
      phone: '+48 602 345 678',
      notes: 'Sprzedaje mieszkanie na Żoliborzu',
      type: 'seller',
      locations: ['zoliborz'],
      price_min: 700000,
      price_max: 900000,
      agent_id: null,
      agent_name: null,
      tags: ['mieszkanie', '3 pokoje']
    });
    
    // Add a sample client-offer relationship
    clientsService.addClientToOffer(client1.id, 'offer-123');
  }
};

// Call initialization on import
initializeMockData();

export default clientsService;