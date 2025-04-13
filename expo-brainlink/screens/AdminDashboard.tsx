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
    fetchDashboardData();
    fetchAnnouncements();
  }, []);

      setIsLoading(true);

      // Mock data for demonstration
      setStats({
        totalUsers: 125,
        totalOffers: 450,
        totalTransactions: 2500000,
        activeAgents: 75
      });

      // Mock activities
      setActivities([
        {
          id: '1',
          type: 'user',
          description: 'Nowy użytkownik dołączył do platformy',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'offer',
          description: 'Dodano nową ofertę sprzedaży',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          type: 'transaction',
          description: 'Zakończono transakcję sprzedaży',
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ]);
    };
  };

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

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Użytkownicy</Text>
            <MaterialIcons name="people" size={24} color="gray" />
          </View>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Oferty</Text>
            <MaterialIcons name="home" size={24} color="gray" />
          </View>
          <Text style={styles.statValue}>{stats.totalOffers}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Transakcje</Text>
            <Feather name="trending-up" size={24} color="gray" />
          </View>
          <Text style={styles.statValue}>{stats.totalTransactions.toLocaleString()} PLN</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>Aktywni agenci</Text>
            <MaterialIcons name="verified-user" size={24} color="gray" />
          </View>
          <Text style={styles.statValue}>{stats.activeAgents}</Text>
        </View>
      </View>

      <View style={styles.activitiesContainer}>
        <Text style={styles.sectionTitle}>Ostatnie aktywności</Text>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTimestamp}>{new Date(activity.created_at).toLocaleString()}</Text>
              </View>
              <MaterialIcons name="person" size={20} color="gray" />
            </View>
          ))
        ) : (
          <Text style={styles.noActivitiesText}>Brak ostatnich aktywności</Text>
        )}
      </View>

      <View style={styles.announcementsContainer}>
        <Text style={styles.sectionTitle}>Office Announcements</Text>
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <View key={announcement.id} style={styles.announcementItem}>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementContent}>{announcement.content}</Text>
              <Text style={styles.announcementTimestamp}>
                {new Date(announcement.createdAt).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noAnnouncementsText}>No announcements yet.</Text>
        )}
      </View>










      {/* System Statistics - Adapt as needed for mobile */}
      <View style={styles.systemStatsContainer}>
        <Text style={styles.sectionTitle}>Statystyki systemu</Text>
        {/* Replace with relevant mobile-friendly stats or remove */}
        <Text style={styles.placeholderText}>System statistics will be displayed here (adapt for mobile).</Text>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1E1E2F', // Example dark card background
    borderRadius: 10,
    padding: 15,
    width: '48%', // Adjust for desired layout
    marginBottom: 10,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    color: 'gray',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  activitiesContainer: {
    backgroundColor: '#1E1E2F',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E40',
  },
  activityDescription: {
    color: 'white',
  },
  activityTimestamp: {
    fontSize: 12,
    color: 'gray',
  },
  noActivitiesText: {
    textAlign: 'center',
    color: 'gray',
    paddingVertical: 20,
  }, announcementsContainer: {
    backgroundColor: '#1E1E2F',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
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