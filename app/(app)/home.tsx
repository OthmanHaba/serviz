import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const services = [
  {
    id: 'towing',
    title: 'Towing Service',
    icon: 'tow-truck',
    description: 'Get your vehicle towed to the nearest repair shop',
  },
  {
    id: 'gas',
    title: 'Gas Delivery',
    icon: 'gas-station',
    description: "Running low on fuel? We'll bring gas to you",
  },
  {
    id: 'mechanic',
    title: 'Mobile Mechanic',
    icon: 'wrench',
    description: 'Professional mechanic will come to your location',
  },
];

export default function HomeScreen() {
  const theme = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const onServiceSelect = (serviceId: string) => {
    router.push({
      pathname: '/request-service',
      params: { 
        serviceId,
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
      },
    });
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
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
          />
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text>{errorMsg || 'Loading map...'}</Text>
        </View>
      )}

      <ScrollView
        style={styles.servicesContainer}
        contentContainerStyle={styles.servicesContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {services.map((service) => (
          <Card
            key={service.id}
            style={styles.serviceCard}
            onPress={() => onServiceSelect(service.id)}
          >
            <Card.Content style={styles.serviceCardContent}>
              <MaterialCommunityIcons
                name={service.icon as any}
                size={40}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.serviceTitle}>
                {service.title}
              </Text>
              <Text variant="bodySmall" style={styles.serviceDescription}>
                {service.description}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.quickActions}>
        <Button
          mode="contained"
          icon="phone"
          onPress={() => {/* TODO: Implement emergency call */}}
          style={styles.emergencyButton}
        >
          Emergency Call
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  servicesContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  servicesContent: {
    paddingVertical: 10,
  },
  serviceCard: {
    width: 200,
    marginHorizontal: 5,
    elevation: 4,
  },
  serviceCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  serviceTitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  serviceDescription: {
    marginTop: 4,
    textAlign: 'center',
    color: '#666',
  },
  quickActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  emergencyButton: {
    borderRadius: 25,
  },
}); 