import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Client } from '../lib/firebase';
import { Customer, CustomerStatus, CustomerCategory } from '../models/CustomerTypes';
import { toast } from 'sonner';

// Function to migrate existing clients to the new customer schema
export const migrateClientsToCustomers = async (): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    // Check if migration has already been done
    const migrationFlagRef = doc(db, 'users', currentUser.uid);
    const migrationDoc = await getDoc(migrationFlagRef);
    
    if (migrationDoc.exists() && migrationDoc.data().clientsMigrated) {
      console.log('Migration already performed');
      return true;
    }

    // Get all clients for this user
    const clientsQuery = query(
      collection(db, 'clients'),
      where('user_id', '==', currentUser.uid)
    );
    
    const clientsSnapshot = await getDocs(clientsQuery);
    
    if (clientsSnapshot.empty) {
      console.log('No clients to migrate');
      return true;
    }

    // Count how many we need to migrate
    const totalClients = clientsSnapshot.size;
    console.log(`Migrating ${totalClients} clients to customers...`);
    
    let migratedCount = 0;

    // Check if customers collection already has data for this user
    const customersQuery = query(
      collection(db, 'customers'),
      where('user_id', '==', currentUser.uid),
      where('migrated_from_client', '==', true)
    );
    
    const customersSnapshot = await getDocs(customersQuery);
    
    // Track which client IDs have already been migrated
    const migratedClientIds = new Set<string>();
    customersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.original_client_id) {
        migratedClientIds.add(data.original_client_id);
      }
    });

    // Migrate each client
    for (const clientDoc of clientsSnapshot.docs) {
      const clientId = clientDoc.id;
      
      // Skip if already migrated
      if (migratedClientIds.has(clientId)) {
        migratedCount++;
        continue;
      }

      const clientData = clientDoc.data() as Client;
      
      // Map client type to customer status and category
      let status: CustomerStatus = 'lead';
      let category: CustomerCategory = 'individual';
      
      if (clientData.client_type === 'buyer') {
        status = 'active';
        category = 'individual';
      } else if (clientData.client_type === 'seller') {
        status = 'active';
        category = 'individual';
      }

      // Create new customer object
      const customerData: Omit<Customer, 'id'> = {
        first_name: clientData.first_name,
        last_name: clientData.last_name,
        email: clientData.email,
        phone: clientData.phone,
        notes: clientData.notes,
        status,
        category,
        tags: clientData.tags || [],
        preferences: {
          property_preferences: {
            locations: clientData.locations || [],
            price_min: clientData.price_min || undefined,
            price_max: clientData.price_max || undefined
          }
        },
        user_id: currentUser.uid,
        created_at: clientData.created_at,
        updated_at: clientData.updated_at,
        // Fields to track migration
        migrated_from_client: true,
        original_client_id: clientId
      };

      // Add the new customer
      await addDoc(collection(db, 'customers'), customerData);
      migratedCount++;
    }

    // Set migration flag
    await updateDoc(migrationFlagRef, {
      clientsMigrated: true,
      migrationDate: Timestamp.now()
    });

    console.log(`Migration complete: ${migratedCount}/${totalClients} clients migrated`);
    toast.success(`Successfully migrated ${migratedCount} clients to the new customer system`);
    
    return true;
  } catch (error: any) {
    console.error('Error during migration:', error);
    toast.error('Error during migration: ' + error.message);
    return false;
  }
};