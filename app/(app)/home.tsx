import { View, StyleSheet, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { Text, Card, } from 'react-native-paper';
import { useState, useEffect, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import useServiceStore from '@/stores/serviceStore';
import { updateLocation } from '@/lib/api/provider';
import { useAuthStore } from '@/stores/authStore';
import { refreshServiceForUser } from '@/lib/api/service';
import echo from '@/lib/echo';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isChannelConnected, setIsChannelConnected] = useState(false);
  const { services, fetchServices, setSelectedService } = useServiceStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Connect to the Laravel Reverb channel
    try {

      if (echo.connector.pusher.connection.state == 'connected') {
        setIsChannelConnected(true);
      }
      const channel = echo.channel('notifications');
      // Listen for events on the channel
      channel.listen('NewNotification', (data: any) => {
        console.log('New notification:', data);
      });

      // Cleanup function
      return () => {
        echo.leaveChannel('notifications');
        setIsChannelConnected(false);
      };
    } catch (err: any) {
      console.log('Failed to connect: ' + (err?.message || 'Unknown error'));
      setIsChannelConnected(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      await fetchServices();
      if (status !== 'granted') {
        setErrorMsg('تم رفض إذن الوصول إلى الموقع');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      await updateLocation(
        location.coords.latitude,
        location.coords.longitude
      );
    })();
  }, []);

  // Services refresh scheduler - every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchServices();
      console.log('Services refreshed');
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [fetchServices]);

  // Fallback polling mechanism if Echo is not connected
  useEffect(() => {
    const checkActiveRequest = async () => {
      try {
        const res = await refreshServiceForUser();
        if (res.status === 200) {
          router.push(`/active-requests?id=${res.data.id}`);
        }
      } catch (error) {
        console.error('Error checking active request:', error);
      }
    };

    const interval = setInterval(checkActiveRequest, 10000);
    return () => clearInterval(interval);
  }, []);

  const onServiceSelect = (service: any) => {
    setSelectedService(service);
    router.push({
      pathname: '/request-service',
      params: {
        service,
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Loading Overlay */}
      {!isChannelConnected ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1006F3" />
          <Text style={styles.loadingText}>جاري الاتصال بالإشعارات...</Text>
        </View>
      ) : null}

      {/* Map Container */}
      <View
        style={styles.mapContainer}
        onLayout={() => {
          // Force re-render after layout to ensure proper initialization on Android
          if (Platform.OS === 'android') {
            setTimeout(() => setMapReady(true), 100);
          } else {
            setMapReady(true);
          }
        }}
      >
        {location && mapReady ? (
          <MapView
            key={'map-home-view'}
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            region={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            toolbarEnabled={false}
            loadingEnabled={true}
            loadingIndicatorColor="#1006F3"
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="موقعك الحالي"
            >
              <View style={[styles.markerContainer]}>
                <MaterialCommunityIcons
                  name="map-marker-radius"
                  size={24}
                  color="#FF4444"
                />
              </View>
            </Marker>

          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text>{errorMsg || 'جاري تحميل الخريطة...'}</Text>
          </View>
        )}
      </View>

      {/* Services ScrollView */}
      <ScrollView
        style={styles.servicesContainer}
        contentContainerStyle={styles.servicesContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {services?.length > 0 ? services.map((service) => (
          <Card
            key={service.id}
            style={styles.serviceCard}
            onPress={() => onServiceSelect(service)}
          >
            <Card.Content style={styles.serviceCardContent}>
              <Image
                source={{ uri: service.image }}
                style={{ width: 62, height: 62 }}
                resizeMode="contain"
              />
              <Text variant="titleMedium" style={styles.serviceTitle}>
                {service.name}
              </Text>
              <Text variant="bodySmall" style={styles.serviceDescription}>
                {service.description}
              </Text>
            </Card.Content>
          </Card>
        )) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Card style={[styles.serviceCard, { backgroundColor: '#f5f5f5' }]}>
              <Card.Content style={styles.serviceCardContent}>
                <View style={{ width: 40, height: 40, backgroundColor: '#e0e0e0', borderRadius: 20 }} />
                <View style={{ width: '80%', height: 20, backgroundColor: '#e0e0e0', marginTop: 8, borderRadius: 4 }} />
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mapContainer: {
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
    bottom: 10,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1006F3',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});