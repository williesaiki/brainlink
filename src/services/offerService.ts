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
import { db, auth } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  area: number;
  rooms: number;
  buildingYear?: number;
  floor?: number;
  media: {
    internet: boolean;
    water: boolean;
    gas: boolean;
    electricity: boolean;
  };
  images: string[];
  external_id?: string;
  agent_id: string;
  agent_name: string;
  agent_email: string;
  agent_phone: string;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
  user_id: string;
}

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

export const offerService = {
  async getOffers(status?: 'active' | 'draft'): Promise<Offer[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }

      let offersQuery = query(
        collection(db, 'offers'),
        where('user_id', '==', currentUser.uid),
        where('status', '==', status || 'active')
      );

      const querySnapshot = await getDocs(offersQuery);
      const offers: Offer[] = [];

      querySnapshot.forEach((doc) => {
        offers.push(convertFirebaseDoc<Offer>(doc));
      });

      offers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return offers;
    } catch (error: any) {
      console.error('Błąd podczas pobierania ofert:', error);
      toast.error('Nie udało się załadować ofert');
      return [];
    }
  },

  async getOffer(id: string): Promise<Offer | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }

      const docRef = doc(db, 'offers', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return convertFirebaseDoc<Offer>(docSnap);
    } catch (error: any) {
      console.error('Błąd podczas pobierania oferty:', error);
      toast.error('Nie udało się załadować oferty');
      return null;
    }
  },

  async createOffer(offerData: Omit<Offer, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Offer> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }

      const now = Timestamp.now();
      const newOffer = {
        ...offerData,
        user_id: currentUser.uid,
        created_at: now,
        updated_at: now
      };

      const docRef = doc(collection(db, 'offers'));
      await setDoc(docRef, newOffer);

      return {
        id: docRef.id,
        ...newOffer,
        created_at: now.toDate().toISOString(),
        updated_at: now.toDate().toISOString()
      } as Offer;
    } catch (error: any) {
      console.error('Błąd podczas tworzenia oferty:', error);
      toast.error('Nie udało się utworzyć oferty');
      throw error;
    }
  },

  async updateOffer(id: string, updates: Partial<Offer>): Promise<Offer> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }

      const offerRef = doc(db, 'offers', id);
      const offerDoc = await getDoc(offerRef);

      if (!offerDoc.exists()) {
        throw new Error('Nie znaleziono oferty');
      }

      if (offerDoc.data().user_id !== currentUser.uid) {
        throw new Error('Brak uprawnień');
      }

      const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      const now = Timestamp.now();
      const updateData = {
        ...cleanUpdates,
        updated_at: now
      };

      await updateDoc(offerRef, updateData);

      const updatedDoc = await getDoc(offerRef);
      return convertFirebaseDoc<Offer>(updatedDoc);
    } catch (error: any) {
      console.error('Błąd podczas aktualizacji oferty:', error);
      toast.error('Nie udało się zaktualizować oferty');
      throw error;
    }
  },

  async deleteOffer(id: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }

      const offerRef = doc(db, 'offers', id);
      const offerDoc = await getDoc(offerRef);

      if (!offerDoc.exists()) {
        throw new Error('Nie znaleziono oferty');
      }

      if (offerDoc.data().user_id !== currentUser.uid) {
        throw new Error('Brak uprawnień');
      }

      await deleteDoc(offerRef);

      const clientOffersQuery = query(
        collection(db, 'client_offers'),
        where('offer_id', '==', id)
      );

      const clientOffersSnapshot = await getDocs(clientOffersQuery);
      const deletePromises = clientOffersSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);

      toast.success('Oferta została usunięta');
    } catch (error: any) {
      console.error('Błąd podczas usuwania oferty:', error);
      toast.error('Nie udało się usunąć oferty');
      throw error;
    }
  },

  async importExternalOffer(externalId: string, offerData: any): Promise<Offer> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Brak aktywnej sesji');
      }

      const existingQuery = query(
        collection(db, 'offers'),
        where('external_id', '==', externalId),
        where('user_id', '==', currentUser.uid)
      );

      const existingDocs = await getDocs(existingQuery);
      if (!existingDocs.empty) {
        const existingDoc = existingDocs.docs[0];
        const now = Timestamp.now();
        const updateData = {
          ...offerData,
          updated_at: now
        };

        await updateDoc(existingDoc.ref, updateData);
        
        const updatedDoc = await getDoc(existingDoc.ref);
        return convertFirebaseDoc<Offer>(updatedDoc);
      }

      const now = Timestamp.now();
      const newOffer = {
        ...offerData,
        external_id: externalId,
        user_id: currentUser.uid,
        created_at: now,
        updated_at: now,
        status: 'active'
      };

      const docRef = doc(collection(db, 'offers'));
      await setDoc(docRef, newOffer);

      return {
        id: docRef.id,
        ...newOffer,
        created_at: now.toDate().toISOString(),
        updated_at: now.toDate().toISOString()
      } as Offer;
    } catch (error: any) {
      console.error('Błąd podczas importowania oferty:', error);
      toast.error('Nie udało się zaimportować oferty');
      throw error;
    }
  }
};

export default offerService;