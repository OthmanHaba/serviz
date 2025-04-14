import { View, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { Text, Card, Button, Avatar, IconButton } from 'react-native-paper';
import { useState, useEffect, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getActiveRequestData } from "@/lib/api/service"
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { completeActiveRequest } from '@/lib/api/request';
import { ServiceRequest } from '@/app/types/request';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

export default function ActiveRequestsScreen() {
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [providerLocation, setProviderLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const requestId = typeof params.id === 'string' ? parseInt(params.id, 10) : Number(params.id);
        const res = await getActiveRequestData(requestId);
        setActiveRequest(res.data);
        setLocation(await Location.getCurrentPositionAsync());
        if (user?.role === 'provider') {
          setProviderLocation({
            latitude: Number(res.data.provider.current_location.latitude),
            longitude: Number(res.data.provider.current_location.longitude),
            altitude: 0,
            accuracy: 0,
            altitudeAccuracy: 0,
            heading: 0,
            speed: 0
          });
        } else {
          setUserLocation({
            latitude: Number(res.data.user.current_location.latitude),
            longitude: Number(res.data.user.current_location.longitude),
            altitude: 0,
            accuracy: 0,
            altitudeAccuracy: 0,
            heading: 0,
            speed: 0
          });
        }
      } catch (error) {
        console.error('Error fetching request data:', error);
        setMapError('Failed to load request data');
        setErrorMsg(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    })();
  }, [params.id]);

  const getStatusColor = () => {
    if (!activeRequest) return '#6B7280';

    switch (activeRequest.status) {
      case 'PendingUserApproved':
        return '#FCD34D';
      case 'PendingProviderApproved':
        return '#60A5FA';
      case 'InProgress':
        return '#F472B6';
      case 'Completed':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    if (!activeRequest) return 'Loading...';

    switch (activeRequest.status) {
      case 'PendingUserApproved':
        return 'Waiting for your approval...';
      case 'PendingProviderApproved':
        return 'Wating provider approval...';
      case 'InProgress':
        return 'Service in progress';
      case 'Completed':
        return 'Service completed';
      default:
        return 'Unknown status';
    }
  };


  const renderUserCard = () => {
    if (!activeRequest || !activeRequest.user) return null;

    return (
      <Card style={styles.userCard}>
        <Card.Content style={styles.userContent}>
          <View style={styles.userInfo}>
            <Avatar.Text
              size={50}
              label={activeRequest.user.name
                .split(' ')
                .map(n => n[0])
                .join('')}
            />  
          </View>
          <View style={styles.userDetails}>
            <Text variant="titleMedium">{activeRequest.user.name}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderProviderCard = () => {
    if (!activeRequest || !activeRequest.provider) return null;

    return (
      <Card style={styles.providerCard}>
        <Card.Content style={styles.providerContent}>
          <View style={styles.providerInfo}>
            <Avatar.Text
              size={50}
              label={activeRequest.provider.name
                .split(' ')
                .map(n => n[0])
                .join('')}
            />
            <View style={styles.providerDetails}>
              <Text variant="titleMedium">{activeRequest.provider.name}</Text>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#FCD34D" />
                <Text>{activeRequest.provider.rating}</Text>
              </View>
            </View>
          </View>
          <View style={styles.providerActions}>
            <IconButton
              icon="phone"
              mode="contained"
              onPress={() => {/* TODO: Implement call */ }}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (!activeRequest) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="clipboard-text" size={64} color="#9CA3AF" />
        <View style={styles.emptyText}>
          <ActivityIndicator size="large" color="#1006F3" />
          <Text style={{ marginTop: 16, color: '#6B7280', textAlign: 'center' }}>Loading request details...</Text>
        </View>
      </View>
    );
  }

  const handleComplete = async () => {
    if (!activeRequest) return;

    setIsLoading(true);

    try {
      await completeActiveRequest(activeRequest.id);
      setIsLoading(false);
      Alert.alert('request completed successfully');
      router.push('/(app)/dashboard');
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }

  const isWithinRadius = (point1: Location.LocationObjectCoords, point2: Location.LocationObjectCoords) => {
    const distance = getDistance(
      { latitude: point1.latitude, longitude: point1.longitude },
      { latitude: point2.latitude, longitude: point2.longitude }
    );
    return distance <= 2000; // 2km in meters
  };

  return (
    <View style={styles.container}>
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
            ref={mapRef}
            key={'map-active-request'}
            style={styles.map}
            provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location?.coords.latitude ?? 12,
              longitude: location?.coords.longitude ?? 12,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            region={{
              latitude: location?.coords.latitude ?? 12,
              longitude: location?.coords.longitude ?? 12,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            toolbarEnabled={false}
            loadingEnabled={true}
            loadingIndicatorColor="#1006F3"
          >
            {user?.role === 'provider' && providerLocation && location && isWithinRadius(location.coords, providerLocation) && (
              <Marker
                coordinate={{
                  latitude: providerLocation.latitude,
                  longitude: providerLocation.longitude
                }}
                title={activeRequest.provider.name}
              >
                <View style={[styles.markerContainer]}>
                  <MaterialCommunityIcons
                    name="car-connected"
                    size={32}
                    color="red"
                  />
                </View>
              </Marker>
            )}
            {user?.role === 'user' && userLocation && location && isWithinRadius(location.coords, userLocation) && (
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude
                }}
                title={activeRequest.user.name || "User"}
              >
                <View style={[styles.markerContainer]}>
                  <MaterialCommunityIcons
                    name="account"
                    size={32}
                    color="#FF5733"
                  />
                </View>
              </Marker>
            )}

            <Marker
              coordinate={{
                latitude: location?.coords.latitude ?? 12,
                longitude: location?.coords.longitude ?? 12
              }}
              title={activeRequest.user.name || "User"}
            >
              <View style={[styles.markerContainer]}>
                <MaterialCommunityIcons
                  name="account"
                  size={32}
                  color="#FF5733"
                />
              </View>
            </Marker>

          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#1006F3" />
            <Text>{mapError || 'Loading map...'}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {user?.role === 'provider' &&
          <View style={styles.statusCard}>
            <View>
              <Button mode="contained" onPress={() => handleComplete()} style={{ marginTop: 10 }} loading={isLoading} disabled={isLoading}>
                Complete
              </Button>
            </View>
          </View>
        }
        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Text variant="titleMedium">Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
            </View>
            {activeRequest.estimatedArrival && (
              <Text style={styles.eta}>
                Estimated arrival: {activeRequest.estimatedArrival}
              </Text>
            )}
          </Card.Content>
        </Card>


        {user?.role === 'provider' && renderUserCard()}
        {user?.role === 'user' && renderProviderCard()}
        {isLoading && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>
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
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    padding: 20,
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
  statusCard: {
    marginBottom: 10,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  eta: {
    marginTop: 10,
    color: '#6B7280',
  },
  providerCard: {
    marginBottom: 10,
  },
  providerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerDetails: {
    marginLeft: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  providerActions: {
    flexDirection: 'row',
  },
  emergencyButton: {
    borderRadius: 25,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    marginTop: 16,
    color: '#6B7280',
  },
  chatModal: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    height: '80%',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
  },
  providerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
  },
  messageText: {
    color: '#fff',
  },
  userCard: {
    marginBottom: 10,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
}); 