import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Client, ClientOffer } from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Helper function to convert Firebase document to our expected type
const convertFirebaseDoc = <T>(doc: DocumentData): T => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    created_at: data.created_at?.toDate?.() 
      ? data.created_at.toDate().toISOString() 
      : new Date().toISOString(),
    updated_at: data.updated_at?.toDate?.() 
      ? data.updated_at.toDate().toISOString() 
      : new Date().toISOString()
  } as T;
};

// Client service functions
export const clientsService = {
  async getClients(type?: 'buyer' | 'seller'): Promise<Client[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return []; // Return empty array instead of throwing error
      }
      
      const clientsQuery = query(
        collection(db, 'clients'),
        where('user_id', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(clientsQuery);
      const clients: Client[] = [];
      
      querySnapshot.forEach((doc) => {
        const client = convertFirebaseDoc<Client>(doc);
        if (!type || client.client_type === type) {
          clients.push(client);
        }
      });
      
      clients.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      
      return clients;
    } catch (error: any) {
      console.error('Błąd podczas pobierania klientów:', error);
      return []; // Return empty array instead of showing error toast
    }
  },

  async getClient(id: string): Promise<Client | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }
      
      const docRef = doc(db, 'clients', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Nie znaleziono klienta');
      }
      
      return convertFirebaseDoc<Client>(docSnap);
    } catch (error: any) {
      console.error('Błąd podczas pobierania klienta:', error);
      toast.error('Nie udało się załadować danych klienta');
      return null;
    }
  },

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Client> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }
      
      const now = Timestamp.now();
      const clientId = uuidv4();
      
      const newClient = {
        ...clientData,
        user_id: currentUser.uid,
        created_at: now,
        updated_at: now
      };
      
      if (!newClient.client_type) {
        newClient.client_type = 'buyer';
      }
      
      if (!newClient.tags) {
        newClient.tags = [];
      }
      
      await setDoc(doc(db, 'clients', clientId), newClient);
      
      toast.success('Klient został dodany pomyślnie');
      
      return {
        id: clientId,
        ...clientData,
        user_id: currentUser.uid,
        created_at: now.toDate().toISOString(),
        updated_at: now.toDate().toISOString()
      } as Client;
    } catch (error: any) {
      console.error('Błąd podczas tworzenia klienta:', error);
      toast.error('Nie udało się dodać klienta: ' + error.message);
      throw error;
    }
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }
      
      const clientRef = doc(db, 'clients', id);
      const clientDoc = await getDoc(clientRef);
      
      if (!clientDoc.exists()) {
        throw new Error('Nie znaleziono klienta');
      }
      
      const updatedData = {
        ...updates,
        updated_at: Timestamp.now()
      };
      
      await updateDoc(clientRef, updatedData);
      
      toast.success('Dane klienta zostały zaktualizowane');
      
      const updatedDocSnap = await getDoc(clientRef);
      return convertFirebaseDoc<Client>(updatedDocSnap);
    } catch (error: any) {
      console.error('Błąd podczas aktualizacji klienta:', error);
      toast.error('Nie udało się zaktualizować danych klienta');
      throw error;
    }
  },

  async deleteClient(id: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }
      
      await deleteDoc(doc(db, 'clients', id));
      
      const clientOffersQuery = query(
        collection(db, 'client_offers'),
        where('client_id', '==', id)
      );
      
      const clientOffersSnapshot = await getDocs(clientOffersQuery);
      const deletePromises = clientOffersSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      toast.success('Klient został usunięty');
    } catch (error: any) {
      console.error('Błąd podczas usuwania klienta:', error);
      toast.error('Nie udało się usunąć klienta');
      throw error;
    }
  },

  async getClientOffers(clientId: string): Promise<ClientOffer[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }
      
      const clientOffersQuery = query(
        collection(db, 'client_offers'),
        where('client_id', '==', clientId)
      );
      
      const querySnapshot = await getDocs(clientOffersQuery);
      const clientOffers: ClientOffer[] = [];
      
      querySnapshot.forEach((doc) => {
        clientOffers.push(convertFirebaseDoc<ClientOffer>(doc));
      });
      
      return clientOffers;
    } catch (error: any) {
      console.error('Błąd podczas pobierania ofert klienta:', error);
      return [];
    }
  },

  async addClientToOffer(clientId: string, offerId: string): Promise<ClientOffer> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }
      
      const now = Timestamp.now();
      const clientOfferId = uuidv4();
      
      const newClientOffer = {
        client_id: clientId,
        offer_id: offerId,
        user_id: currentUser.uid,
        status: 'active',
        created_at: now
      };
      
      await setDoc(doc(db, 'client_offers', clientOfferId), newClientOffer);
      
      toast.success('Klient został przypisany do oferty');
      
      return {
        id: clientOfferId,
        ...newClientOffer,
        created_at: now.toDate().toISOString()
      } as ClientOffer;
    } catch (error: any) {
      console.error('Błąd podczas przypisywania klienta do oferty:', error);
      toast.error('Nie udało się przypisać klienta do oferty');
      throw error;
    }
  },

  async removeClientFromOffer(clientId: string, offerId: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }
      
      const clientOffersQuery = query(
        collection(db, 'client_offers'),
        where('client_id', '==', clientId),
        where('offer_id', '==', offerId)
      );
      
      const querySnapshot = await getDocs(clientOffersQuery);
      
      if (querySnapshot.empty) {
        throw new Error('Nie znaleziono powiązania klient-oferta');
      }
      
      await deleteDoc(querySnapshot.docs[0].ref);
      
      toast.success('Klient został usunięty z oferty');
    } catch (error: any) {
      console.error('Błąd podczas usuwania klienta z oferty:', error);
      toast.error('Nie udało się usunąć klienta z oferty');
      throw error;
    }
  },

  async getClientsForOffer(offerId: string): Promise<Client[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }
      
      const clientOffersQuery = query(
        collection(db, 'client_offers'),
        where('offer_id', '==', offerId)
      );
      
      const clientOffersSnapshot = await getDocs(clientOffersQuery);
      
      if (clientOffersSnapshot.empty) {
        return [];
      }
      
      const clientIds = clientOffersSnapshot.docs.map(doc => 
        doc.data().client_id
      );
      
      const clientPromises = clientIds.map(clientId => 
        getDoc(doc(db, 'clients', clientId))
      );
      
      const clientDocs = await Promise.all(clientPromises);
      
      const clients = clientDocs
        .filter(doc => doc.exists())
        .map(doc => convertFirebaseDoc<Client>(doc));
      
      return clients;
    } catch (error: any) {
      console.error('Błąd podczas pobierania klientów dla oferty:', error);
      return [];
    }
  }
};

export default clientsService;