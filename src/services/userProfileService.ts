import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  displayName: string;
  photoURL: string;
  email: string;
  phone?: string;
  location?: string;
  role?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

// Event emitter for profile updates
const profileUpdateListeners = new Set<() => void>();

export const userProfileService = {
  // Subscribe to profile updates
  subscribe(listener: () => void) {
    profileUpdateListeners.add(listener);
    return () => profileUpdateListeners.delete(listener);
  },

  // Notify listeners of profile updates
  notifyProfileUpdate() {
    profileUpdateListeners.forEach(listener => listener());
  },

  async createProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: profile.displayName,
        photoURL: profile.photoURL
      });

      // Update Firestore profile
      const now = new Date();
      const profileData = {
        ...profile,
        created_at: now,
        updated_at: now
      };
      
      await setDoc(doc(db, 'user_profiles', currentUser.uid), profileData);
      
      this.notifyProfileUpdate();
      toast.success('Profile created successfully');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
      throw error;
    }
  },

  async getProfile(userId?: string): Promise<UserProfile | null> {
    try {
      const uid = userId || auth.currentUser?.uid;
      if (!uid) {
        throw new Error('No user ID provided');
      }

      const docRef = doc(db, 'user_profiles', uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create default profile if it doesn't exist
        const currentUser = auth.currentUser;
        if (currentUser) {
          const defaultProfile = {
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            photoURL: currentUser.photoURL || 'https://via.placeholder.com/150',
            email: currentUser.email || '',
            created_at: new Date(),
            updated_at: new Date()
          };
          await this.createProfile(defaultProfile);
          return {
            id: uid,
            ...defaultProfile
          } as UserProfile;
        }
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as UserProfile;
    } catch (error: any) {
      console.error('Error getting profile:', error);
      toast.error('Failed to load profile');
      return null;
    }
  },

  async updateProfile(updates: Partial<UserProfile>) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Update Firebase Auth profile if name or photo changed
      if (updates.displayName || updates.photoURL) {
        await updateProfile(currentUser, {
          displayName: updates.displayName,
          photoURL: updates.photoURL
        });
      }

      // Update Firestore profile
      const docRef = doc(db, 'user_profiles', currentUser.uid);
      await updateDoc(docRef, {
        ...updates,
        updated_at: new Date()
      });

      this.notifyProfileUpdate();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  },

  async uploadProfilePhoto(file: File): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Upload photo to Firebase Storage
      const fileRef = ref(storage, `profile_photos/${currentUser.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      const photoURL = await getDownloadURL(fileRef);

      // Update both Auth profile and Firestore profile
      await Promise.all([
        updateProfile(currentUser, { photoURL }),
        this.updateProfile({ photoURL })
      ]);
      
      return photoURL;
    } catch (error: any) {
      console.error('Error uploading profile photo:', error);
      toast.error('Failed to upload photo');
      throw error;
    }
  },

  async migrateExistingUsers() {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const profileRef = doc(db, 'user_profiles', userDoc.id);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          await setDoc(profileRef, {
            displayName: userData.email?.split('@')[0] || 'User',
            photoURL: 'https://via.placeholder.com/150',
            email: userData.email || '',
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }

      console.log('User profiles migration completed');
    } catch (error) {
      console.error('Error migrating user profiles:', error);
    }
  }
};