import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { toast } from 'sonner';
import { app } from './firebase';
import { userProfileService } from '../services/userProfileService';

export const auth = getAuth(app);
export const db = getFirestore(app);

export interface UserProfile {
  email: string;
  role: string;
  created_at: Date;
  last_login: Date | null;
  displayName?: string;
  photoURL?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: userCredential.user.email,
        role: email === 'admin@gmail.com' ? 'admin' : 'user',
        last_login: Timestamp.now()
      }, { merge: true });

      // Ensure user profile exists
      const profile = await userProfileService.getProfile();
      if (!profile) {
        await userProfileService.createProfile({
          displayName: email.split('@')[0],
          photoURL: 'https://via.placeholder.com/150',
          email: email
        });
      }

      toast.success('Zalogowano pomyślnie');
      return true;

    } catch (error: any) {
      console.error('Błąd logowania:', error);
      
      if (error.code === 'auth/invalid-credential') {
        toast.error('Nieprawidłowy email lub hasło');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('Użytkownik nie istnieje');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Nieprawidłowe hasło');
      } else {
        toast.error('Błąd logowania. Spróbuj ponownie.');
      }
      
      return false;
    }
  },

  async signup(email: string, password: string, profile?: { displayName: string; photoURL?: string }): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: userCredential.user.email,
        role: 'user',
        created_at: Timestamp.now(),
        last_login: Timestamp.now()
      });

      // Create user profile
      await userProfileService.createProfile({
        displayName: profile?.displayName || email.split('@')[0],
        photoURL: profile?.photoURL || 'https://via.placeholder.com/150',
        email: email
      });
      
      toast.success('Konto zostało utworzone pomyślnie!');
      return true;
    } catch (error: any) {
      console.error('Błąd rejestracji:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Ten adres email jest już używany');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Hasło jest zbyt słabe');
      } else {
        toast.error('Błąd podczas tworzenia konta');
      }
      
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      toast.success('Wylogowano pomyślnie');
    } catch (error: any) {
      console.error('Błąd wylogowania:', error);
      toast.error('Błąd podczas wylogowywania');
    }
  },

  async getCurrentUser(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      return await userProfileService.getProfile(userId);
    } catch (error) {
      console.error('Błąd podczas pobierania profilu użytkownika:', error);
      return null;
    }
  }
};