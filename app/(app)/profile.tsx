import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import {
  Text,
  Avatar,
  Button,
  useTheme,
  Surface,
  Divider,
} from 'react-native-paper';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { profile } from '@/lib/api/provider';

type Profile = {
  id: number;
  name: string;
  email: string;
  remember_token: string;
  email_verified_at: string;
  phone: string;
  vehicle_info: object;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  wallet: {
    balance: number;
  };
  provider_services?: {
    service: number;
    price: string;
  }[];
}

export default function ProfileScreen() {
  const theme = useTheme();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await profile();
      setUserProfile(res.data);
      console.log('----------------------------');
      console.log(userProfile);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error('Profile loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !userProfile) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={theme.colors.error}
        />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadProfile}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.header} elevation={1}>
          <Avatar.Text
            size={80}
            label={userProfile.name.split(' ').map(n => n[0]).join('')}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text variant="headlineSmall" style={styles.name}>
              {userProfile.name}
            </Text>
            <Text variant="bodyMedium" style={styles.role}>
              {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
            </Text>
          </View>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <MaterialCommunityIcons name="email" size={20} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.contactText}>
                {userProfile.email}
              </Text>
            </View>
            <View style={styles.contactItem}>
              <MaterialCommunityIcons name="phone" size={20} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.contactText}>
                {userProfile.phone}
              </Text>
            </View>
          </View>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="wallet" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>Wallet Balance</Text>
          </View>
          <Text variant="displaySmall" style={styles.balance}>
            ${userProfile?.wallet?.balance ?? '0'}
          </Text>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="car" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>Vehicle Information</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.vehicleDetails}>
            {Object.entries(JSON.parse(userProfile.vehicle_info)).map(([key, value]) => (
              <View key={key} style={styles.vehicleRow}>
                <Text variant="bodyMedium" style={styles.vehicleLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Text variant="bodyLarge">{value as string}</Text>
              </View>
            ))}

          </View>
        </Surface>

        {userProfile.provider_services?.length > 0 && (
          <Surface style={styles.section} elevation={1}>
            <View style={{...styles.sectionHeader,justifyContent:'space-between'}}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="tools" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.sectionTitle}>Services Offered</Text>
              </View>
              <Button
                mode="contained"
                onPress={() => {/* TODO: Implement add or remove service */ }}
                style={styles.actionButton}
              >
                <MaterialCommunityIcons name="plus" size={24} color={'white'} />
              </Button>
            </View>
            <Divider style={styles.divider} />
            {userProfile.provider_services?.map((service, index) => (
              <View key={index} style={styles.serviceRow}>
                <Text variant="bodyMedium">Service #{service.service}</Text>
                <Text variant="bodyLarge" style={styles.servicePrice}>
                  ${service.price}
                </Text>
              </View>
            ))}
          </Surface>
        )}

        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="account-edit"
            onPress={() => {/* TODO: Implement edit profile */ }}
            style={styles.actionButton}
          >
            Edit Profile
          </Button>
          <Button
            mode="outlined"
            icon="logout"
            onPress={() => router.replace('/login')}
            style={styles.actionButton}
          >
            Log Out
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginVertical: 16,
    textAlign: 'center',
    color: 'red',
  },
  header: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  avatar: {
    alignSelf: 'center',
  },
  name: {
    fontWeight: 'bold',
  },
  role: {
    color: '#666',
    marginTop: 4,
  },
  contactInfo: {
    marginTop: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  contactText: {
    marginLeft: 8,
    color: '#666',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 8,
    fontWeight: '600',
  },
  balance: {
    textAlign: 'center',
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  vehicleDetails: {
    gap: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleLabel: {
    color: '#666',
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  servicePrice: {
    fontWeight: '600',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
  smallActitionButton: {
    padding: 0,
    borderRadius: 4,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  }
}); 