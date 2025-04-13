import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  serverTimestamp,
  limit,
  startAfter,
  DocumentSnapshot,
  Query,
  FieldPath 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { 
  Customer, 
  CustomerStatus, 
  CustomerCategory, 
  Communication, 
  Purchase 
} from '../models/CustomerTypes';

// Helper function to convert Firestore timestamp to ISO string
const convertTimestamp = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return new Date(timestamp).toISOString();
};

// Customer service class
class CustomerService {
  // Get all customers with pagination
  async getCustomers(
    options: {
      status?: CustomerStatus;
      category?: CustomerCategory;
      tags?: string[];
      search?: string;
      lastVisible?: DocumentSnapshot;
      limit?: number;
    } = {}
  ): Promise<{ customers: Customer[]; lastVisible: DocumentSnapshot | null }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const pageSize = options.limit || 20;
      let customersQuery: Query = collection(db, 'customers');
      
      // Base filter for user_id
      customersQuery = query(customersQuery, where('user_id', '==', currentUser.uid));
      
      // Add filters if provided
      if (options.status) {
        customersQuery = query(customersQuery, where('status', '==', options.status));
      }
      
      if (options.category) {
        customersQuery = query(customersQuery, where('category', '==', options.category));
      }
      
      if (options.tags && options.tags.length > 0) {
        // Firebase doesn't support array-contains-any with multiple array-contains
        // so we apply just one tag filter here
        customersQuery = query(customersQuery, where('tags', 'array-contains', options.tags[0]));
      }
      
      // Add sorting
      customersQuery = query(customersQuery, orderBy('created_at', 'desc'));
      
      // Add pagination
      if (options.lastVisible) {
        customersQuery = query(customersQuery, startAfter(options.lastVisible));
      }
      
      customersQuery = query(customersQuery, limit(pageSize));
      
      const snapshot = await getDocs(customersQuery);
      const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
      
      // Convert to customer objects
      let customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: convertTimestamp(doc.data().created_at),
        updated_at: convertTimestamp(doc.data().updated_at),
        last_contact_date: doc.data().last_contact_date ? convertTimestamp(doc.data().last_contact_date) : undefined
      } as Customer));
      
      // If we have search term, we need to filter client-side since Firestore doesn't support text search
      if (options.search && options.search.trim() !== '') {
        const searchLower = options.search.toLowerCase();
        customers = customers.filter(customer => 
          customer.first_name.toLowerCase().includes(searchLower) ||
          customer.last_name.toLowerCase().includes(searchLower) ||
          (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
          (customer.phone && customer.phone.includes(searchLower)) ||
          (customer.company && customer.company.name.toLowerCase().includes(searchLower))
        );
      }
      
      return { customers, lastVisible };
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error('Error fetching customers: ' + error.message);
      return { customers: [], lastVisible: null };
    }
  }

  // Get a single customer by ID
  async getCustomer(id: string): Promise<Customer | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'customers', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      if (data.user_id !== currentUser.uid) {
        throw new Error('Unauthorized access');
      }

      return {
        id: docSnap.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at),
        last_contact_date: data.last_contact_date ? convertTimestamp(data.last_contact_date) : undefined
      } as Customer;
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      toast.error('Error fetching customer: ' + error.message);
      return null;
    }
  }

  // Create a new customer
  async createCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Customer> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const now = Timestamp.now();
      const newCustomer = {
        ...customerData,
        user_id: currentUser.uid,
        created_at: now,
        updated_at: now
      };

      const docRef = await addDoc(collection(db, 'customers'), newCustomer);
      
      toast.success('Customer created successfully');
      
      return {
        id: docRef.id,
        ...newCustomer,
        created_at: now.toDate().toISOString(),
        updated_at: now.toDate().toISOString()
      } as Customer;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error('Error creating customer: ' + error.message);
      throw error;
    }
  }

  // Update an existing customer
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'customers', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Customer not found');
      }

      if (docSnap.data().user_id !== currentUser.uid) {
        throw new Error('Unauthorized access');
      }

      const now = Timestamp.now();
      const updateData = {
        ...updates,
        updated_at: now
      };

      await updateDoc(docRef, updateData);
      
      toast.success('Customer updated successfully');
      
      return {
        id,
        ...docSnap.data(),
        ...updates,
        created_at: convertTimestamp(docSnap.data().created_at),
        updated_at: now.toDate().toISOString()
      } as Customer;
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error('Error updating customer: ' + error.message);
      throw error;
    }
  }

  // Delete a customer
  async deleteCustomer(id: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const docRef = doc(db, 'customers', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Customer not found');
      }

      if (docSnap.data().user_id !== currentUser.uid) {
        throw new Error('Unauthorized access');
      }

      // Delete all related communications
      const communicationsQuery = query(
        collection(db, 'customer_communications'),
        where('customer_id', '==', id)
      );
      const communicationsSnapshot = await getDocs(communicationsQuery);
      const deleteCommsPromises = communicationsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      // Delete all related purchases
      const purchasesQuery = query(
        collection(db, 'customer_purchases'),
        where('customer_id', '==', id)
      );
      const purchasesSnapshot = await getDocs(purchasesQuery);
      const deletePurchasePromises = purchasesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      // Wait for all subcollection deletes
      await Promise.all([...deleteCommsPromises, ...deletePurchasePromises]);
      
      // Delete the customer document
      await deleteDoc(docRef);
      
      toast.success('Customer deleted successfully');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error('Error deleting customer: ' + error.message);
      throw error;
    }
  }

  // Get customer communications
  async getCustomerCommunications(customerId: string): Promise<Communication[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const communicationsQuery = query(
        collection(db, 'customer_communications'),
        where('customer_id', '==', customerId),
        where('user_id', '==', currentUser.uid),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(communicationsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        created_at: convertTimestamp(doc.data().created_at)
      } as Communication));
    } catch (error: any) {
      console.error('Error fetching communications:', error);
      toast.error('Error fetching communications: ' + error.message);
      return [];
    }
  }

  // Add customer communication
  async addCommunication(customerId: string, communication: Omit<Communication, 'id' | 'created_at' | 'user_id'>): Promise<Communication> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Verify the customer exists and belongs to this user
      const customerRef = doc(db, 'customers', customerId);
      const customerSnap = await getDoc(customerRef);
      
      if (!customerSnap.exists()) {
        throw new Error('Customer not found');
      }
      
      if (customerSnap.data().user_id !== currentUser.uid) {
        throw new Error('Unauthorized access');
      }

      const now = Timestamp.now();
      const newCommunication = {
        ...communication,
        customer_id: customerId,
        user_id: currentUser.uid,
        created_at: now
      };

      const docRef = await addDoc(collection(db, 'customer_communications'), newCommunication);
      
      // Update the customer's last_contact_date
      await updateDoc(customerRef, {
        last_contact_date: Timestamp.fromDate(new Date(communication.date)),
        updated_at: now
      });
      
      return {
        id: docRef.id,
        ...newCommunication,
        created_at: now.toDate().toISOString()
      } as Communication;
    } catch (error: any) {
      console.error('Error adding communication:', error);
      toast.error('Error adding communication: ' + error.message);
      throw error;
    }
  }

  // Get customer purchases
  async getCustomerPurchases(customerId: string): Promise<Purchase[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const purchasesQuery = query(
        collection(db, 'customer_purchases'),
        where('customer_id', '==', customerId),
        where('user_id', '==', currentUser.uid),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(purchasesQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        created_at: convertTimestamp(doc.data().created_at),
        updated_at: convertTimestamp(doc.data().updated_at)
      } as Purchase));
    } catch (error: any) {
      console.error('Error fetching purchases:', error);
      toast.error('Error fetching purchases: ' + error.message);
      return [];
    }
  }

  // Add customer purchase
  async addPurchase(customerId: string, purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Purchase> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Verify the customer exists and belongs to this user
      const customerRef = doc(db, 'customers', customerId);
      const customerSnap = await getDoc(customerRef);
      
      if (!customerSnap.exists()) {
        throw new Error('Customer not found');
      }
      
      if (customerSnap.data().user_id !== currentUser.uid) {
        throw new Error('Unauthorized access');
      }

      const now = Timestamp.now();
      const newPurchase = {
        ...purchase,
        customer_id: customerId,
        user_id: currentUser.uid,
        created_at: now,
        updated_at: now
      };

      const docRef = await addDoc(collection(db, 'customer_purchases'), newPurchase);
      
      // Update the customer record
      await updateDoc(customerRef, {
        updated_at: now
      });
      
      return {
        id: docRef.id,
        ...newPurchase,
        created_at: now.toDate().toISOString(),
        updated_at: now.toDate().toISOString()
      } as Purchase;
    } catch (error: any) {
      console.error('Error adding purchase:', error);
      toast.error('Error adding purchase: ' + error.message);
      throw error;
    }
  }

  // Get statistics about customers
  async getCustomerStats(): Promise<{
    total: number;
    byStatus: Record<CustomerStatus, number>;
    byCategory: Record<CustomerCategory, number>;
  }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const customersQuery = query(
        collection(db, 'customers'),
        where('user_id', '==', currentUser.uid)
      );
      
      const snapshot = await getDocs(customersQuery);
      
      // Initialize stats
      const stats = {
        total: snapshot.size,
        byStatus: {
          active: 0,
          inactive: 0,
          lead: 0,
          prospect: 0,
          archived: 0
        } as Record<CustomerStatus, number>,
        byCategory: {
          individual: 0,
          business: 0,
          investor: 0,
          developer: 0,
          other: 0
        } as Record<CustomerCategory, number>
      };
      
      // Aggregate data
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status && stats.byStatus[data.status] !== undefined) {
          stats.byStatus[data.status]++;
        }
        
        if (data.category && stats.byCategory[data.category] !== undefined) {
          stats.byCategory[data.category]++;
        }
      });
      
      return stats;
    } catch (error: any) {
      console.error('Error fetching customer stats:', error);
      return {
        total: 0,
        byStatus: {
          active: 0,
          inactive: 0,
          lead: 0,
          prospect: 0,
          archived: 0
        },
        byCategory: {
          individual: 0,
          business: 0,
          investor: 0,
          developer: 0,
          other: 0
        }
      };
    }
  }

  // Create sample customers for new users
  async createSampleCustomers(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Check if user already has customers
      const customersQuery = query(
        collection(db, 'customers'),
        where('user_id', '==', currentUser.uid),
        limit(1)
      );
      
      const snapshot = await getDocs(customersQuery);
      
      // Only create samples if no customers exist
      if (!snapshot.empty) {
        return;
      }

      console.log('Creating sample customers for new user');
      
      const now = Timestamp.now();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const sampleCustomers = [
        {
          first_name: 'Jan',
          last_name: 'Kowalski',
          email: 'jan.kowalski@example.com',
          phone: '+48 123 456 789',
          status: 'active',
          category: 'individual',
          address: {
            street: 'ul. Jasna 14/22',
            city: 'Warszawa',
            postal_code: '00-001',
            country: 'Polska',
            is_primary: true
          },
          notes: 'Szuka mieszkania na Mokotowie',
          tags: ['pilne', 'gotówka'],
          preferences: {
            preferred_contact_method: 'phone',
            property_preferences: {
              locations: ['mokotow'],
              price_min: 500000,
              price_max: 800000,
              property_types: ['mieszkanie']
            }
          },
          user_id: currentUser.uid,
          created_at: now,
          updated_at: now,
          last_contact_date: Timestamp.fromDate(yesterday)
        },
        {
          first_name: 'Anna',
          last_name: 'Nowak',
          email: 'anna.nowak@example.com',
          phone: '+48 987 654 321',
          status: 'lead',
          category: 'business',
          company: {
            name: 'Nowak Investments Sp. z o.o.',
            tax_id: '5252000103',
            industry: 'Real Estate',
            website: 'https://nowak-investments.example.com'
          },
          job_title: 'CEO',
          address: {
            street: 'ul. Królewska 2',
            city: 'Warszawa',
            postal_code: '00-065',
            country: 'Polska',
            is_primary: true
          },
          notes: 'Zainteresowana inwestycjami w nieruchomości komercyjne',
          tags: ['inwestor', 'premium'],
          preferences: {
            preferred_contact_method: 'email',
            email_subscribed: true,
            property_preferences: {
              locations: ['srodmiescie', 'wola'],
              property_types: ['komercyjne', 'biura']
            }
          },
          user_id: currentUser.uid,
          created_at: now,
          updated_at: now
        },
        {
          first_name: 'Tomasz',
          last_name: 'Zieliński',
          email: 'tomasz.zielinski@example.com',
          phone: '+48 555 123 456',
          status: 'prospect',
          category: 'investor',
          notes: 'Szuka działki pod budowę domu jednorodzinnego',
          tags: ['działka', 'budowa'],
          preferences: {
            preferred_contact_method: 'phone',
            property_preferences: {
              locations: ['wilanow', 'ursynow'],
              price_min: 400000,
              price_max: 900000,
              property_types: ['działka']
            }
          },
          user_id: currentUser.uid,
          created_at: now,
          updated_at: now
        }
      ];
      
      // Add sample customers
      for (const customer of sampleCustomers) {
        await addDoc(collection(db, 'customers'), customer);
      }
      
      // Add sample communications
      const janCommunication = {
        customer_id: '',  // We'll set this after fetching the customer
        type: 'phone',
        date: Timestamp.fromDate(yesterday),
        content: 'Rozmowa o mieszkaniach na Mokotowie. Klient zainteresowany 3-pokojowym mieszkaniem z balkonem.',
        user_id: currentUser.uid,
        created_at: now
      };
      
      // Get Jan's ID
      const janQuery = query(
        collection(db, 'customers'),
        where('user_id', '==', currentUser.uid),
        where('first_name', '==', 'Jan'),
        where('last_name', '==', 'Kowalski')
      );
      
      const janSnapshot = await getDocs(janQuery);
      if (!janSnapshot.empty) {
        const janId = janSnapshot.docs[0].id;
        janCommunication.customer_id = janId;
        await addDoc(collection(db, 'customer_communications'), janCommunication);
      }
      
      console.log('Sample customers created successfully');
    } catch (error) {
      console.error('Error creating sample customers:', error);
    }
  }
}

export const customerService = new CustomerService();