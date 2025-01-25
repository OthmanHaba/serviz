import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Switch, Button, useTheme } from 'react-native-paper';
import { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type DailyStats = {
  totalEarnings: number;
  completedRequests: number;
  totalHours: number;
  rating: number;
};

export default function DashboardScreen() {
  const theme = useTheme();
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [todayStats] = useState<DailyStats>({
    totalEarnings: 185.50,
    completedRequests: 4,
    totalHours: 6,
    rating: 4.8,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    // TODO: Update provider availability status on backend
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <View style={styles.statusLeft}>
            <Text variant="titleMedium">Status</Text>
            <Text
              variant="bodyLarge"
              style={[
                styles.statusText,
                { color: isOnline ? theme.colors.primary : '#6B7280' },
              ]}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
          />
        </Card.Content>
      </Card>

      {location ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          >
            <MaterialCommunityIcons
              name="car-connected"
              size={32}
              color={isOnline ? theme.colors.primary : '#6B7280'}
            />
          </Marker>
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text>{errorMsg || 'Loading map...'}</Text>
        </View>
      )}

      <ScrollView style={styles.statsContainer}>
        <Text variant="titleLarge" style={styles.statsTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content>
              <MaterialCommunityIcons
                name="cash"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleLarge" style={styles.statValue}>
                {formatCurrency(todayStats.totalEarnings)}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Earnings
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleLarge" style={styles.statValue}>
                {todayStats.completedRequests}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Completed
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <MaterialCommunityIcons
                name="clock"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleLarge" style={styles.statValue}>
                {todayStats.totalHours}h
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Hours
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <MaterialCommunityIcons
                name="star"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleLarge" style={styles.statValue}>
                {todayStats.rating}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Rating
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusCard: {
    margin: 16,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flexDirection: 'column',
  },
  statusText: {
    marginTop: 4,
    fontWeight: 'bold',
  },
  map: {
    height: 300,
  },
  mapPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  statsContainer: {
    padding: 24,
    flex: 1,
  },
  statsTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
  },
  statValue: {
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#6B7280',
  },
}); 