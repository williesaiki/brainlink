tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../store/authStore'; // Assuming you'll adapt this for Expo
import { announcementService } from '../services/announcementService';

interface DashboardStats {
  totalUsers: number;
  totalOffers: number;
  totalTransactions: number;
  activeAgents: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  readBy: string[];
  createdAt: string;
  createdBy: string;
  // Add other properties as needed, matching your web app's interface
}

const AdminDashboard = () => {
  const navigation = useNavigation();
  const { logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOffers: 0,
    totalTransactions: 0,
    activeAgents: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);
  
    setIsLoading(true);
    try {
      const fetchedAnnouncements = await announcementService.getAnnouncements();
      setAnnouncements(fetchedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const fetchedAnnouncements = await announcementService.getAnnouncements();
      setAnnouncements(fetchedAnnouncements);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      // Handle error appropriately, e.g., display an error message
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login'); // Adjust based on your navigation setup
      // In a real app, provide user feedback (e.g., a toast message)
    } catch (error) {
      console.error('Logout error:', error);
      // In a real app, handle errors appropriately
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
        {/* Replace with a proper loading indicator if needed */}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel Administracyjny</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={20} color="red" />
          <Text style={styles.logoutText}>Wyloguj się</Text>
        </TouchableOpacity>
      </View>






      {announcements.map((announcement) => (
        <View key={announcement.id} style={styles.announcementItem}>
          <Text style={styles.announcementTitle}>{announcement.title}</Text>
          <Text>{announcement.content}</Text>
          <Text style={styles.announcementTimestamp}>{new Date(announcement.createdAt).toLocaleString()}</Text>
        </View>
      ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000008',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000008',
  },
  loadingText: {
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#010220',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: {
    color: 'red',
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  announcementItem: {
    padding: 15,
    backgroundColor: '#2E2E40',
    borderRadius: 8,
    marginBottom: 10,
  }, sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  announcementItem: {
    padding: 15,
    backgroundColor: '#2E2E40',
    borderRadius: 8,
    marginBottom: 10,
  },
  announcementTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  announcementContent: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  announcementTimestamp: {
    color: 'gray',
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  noAnnouncementsText: {
    color: 'gray',
    textAlign: 'center',
    paddingVertical: 20,
  },
  activityTimestamp: {
    fontSize: 12,
    color: 'gray',
  },

  noActivitiesText: {
  },
  systemStatsContainer: {
    backgroundColor: '#1E1E2F',
    borderRadius: 10,
    padding: 15,
  },
  placeholderText: {
    color: 'gray',
  },
});

export default AdminDashboard;