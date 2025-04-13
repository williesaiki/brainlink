import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { app } from './firebase';

const auth = getAuth(app);
const db = getFirestore(app);

interface UserProfile {
  displayName: string;
  photoURL: string;
  email: string;
}

export const authService = {
  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: userCredential.user.email,
        last_login: Timestamp.now(),
      }, { merge: true });

      // Ensure user profile exists
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          displayName: email.split('@')[0],
          photoURL: 'https://via.placeholder.com/150',
          email: email,
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

  async signup(email: string, password: string, profile?: UserProfile): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: userCredential.user.email,
        created_at: Timestamp.now(),
        last_login: Timestamp.now(),
        displayName: profile?.displayName || email.split('@')[0],
        photoURL: profile?.photoURL || 'https://via.placeholder.com/150',
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
};