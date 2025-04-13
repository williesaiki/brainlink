import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  arrayUnion,
  limit
} from 'firebase/firestore';
import { db, auth, Announcement } from '../lib/firebase';
import { toast } from 'sonner';

export const announcementService = {
  async getAnnouncements(limitCount: number = 10): Promise<Announcement[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(announcementsQuery);
      const announcements: Announcement[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        announcements.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          priority: data.priority,
          readBy: data.readBy || [],
          createdAt: data.createdAt?.toDate?.() 
            ? data.createdAt.toDate().toISOString() 
            : new Date().toISOString(),
          createdBy: data.createdBy
        } as Announcement);
      });

      return announcements;
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },

  async markAsRead(announcementId: string): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const announcementRef = doc(db, 'announcements', announcementId);
      await updateDoc(announcementRef, {
        readBy: arrayUnion(currentUser.uid)
      });

      return true;
    } catch (error: any) {
      console.error('Error marking announcement as read:', error);
      return false;
    }
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt' | 'createdBy' | 'readBy'>): Promise<Announcement | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const now = Timestamp.now();
      const newAnnouncement = {
        ...announcement,
        createdAt: now,
        createdBy: currentUser.uid,
        readBy: []
      };

      const docRef = doc(collection(db, 'announcements'));
      await setDoc(docRef, newAnnouncement);

      return {
        id: docRef.id,
        ...announcement,
        createdAt: now.toDate().toISOString(),
        createdBy: currentUser.uid,
        readBy: []
      } as Announcement;
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
      return null;
    }
  }
};

export default announcementService;