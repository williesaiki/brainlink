import { collection, doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { toast } from 'sonner';

export const createSampleAnnouncement = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    // Check if we already have sample announcements
    const announcementsCollection = collection(db, 'announcements');
    const sampleAnnouncementId = 'sample-announcement-1';
    const docRef = doc(announcementsCollection, sampleAnnouncementId);
    const docSnap = await getDoc(docRef);

    // Only create if it doesn't exist
    if (!docSnap.exists()) {
      const now = Timestamp.now();
      
      await setDoc(docRef, {
        title: 'Ważne ogłoszenie biura',
        content: 'Przypominamy o cotygodniowym spotkaniu zespołu w piątek o 10:00. Prosimy o przygotowanie raportów sprzedażowych za ostatni miesiąc.',
        priority: 'high',
        createdAt: now,
        createdBy: currentUser.uid,
        readBy: []
      });

      console.log('Sample announcement created successfully');
      return true;
    } else {
      console.log('Sample announcement already exists');
      return false;
    }
  } catch (error) {
    console.error('Error creating sample announcement:', error);
    return false;
  }
};

export default { createSampleAnnouncement };