import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, Avatar, IconButton, Portal, Modal } from 'react-native-paper';
import { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { io } from 'socket.io-client';

// TODO: Replace with actual API endpoint
const SOCKET_URL = 'http://localhost:3000';

type Provider = {
  id: string;
  name: string;
  rating: number;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
  };
};

type ServiceRequest = {
  id: string;
  status: 'pending' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed';
  serviceType: string;
  provider?: Provider;
  createdAt: string;
  estimatedArrival?: string;
};

export default function ActiveRequestsScreen() {
  const [activeRequest, setActiveRequest] = useState<ServiceRequest>({
    id: '123',
    status: 'accepted',
    serviceType: 'towing',
    provider: {
      id: 'p1',
      name: 'John Smith',
      rating: 4.8,
      phone: '+1234567890',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    },
    createdAt: new Date().toISOString(),
    estimatedArrival: '10 minutes',
  });
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('provider_location', (data: { latitude: number; longitude: number }) => {
      if (activeRequest?.provider) {
        setActiveRequest(prev => ({
          ...prev,
          provider: {
            ...prev.provider!,
            location: data,
          },
        }));
      }
    });

    newSocket.on('request_status', (data: { status: ServiceRequest['status'] }) => {
      setActiveRequest(prev => ({
        ...prev,
        status: data.status,
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const getStatusColor = () => {
    switch (activeRequest.status) {
      case 'pending':
        return '#FCD34D';
      case 'accepted':
        return '#60A5FA';
      case 'en_route':
        return '#34D399';
      case 'arrived':
        return '#818CF8';
      case 'in_progress':
        return '#F472B6';
      case 'completed':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (activeRequest.status) {
      case 'pending':
        return 'Finding a service provider...';
      case 'accepted':
        return 'Provider has accepted your request';
      case 'en_route':
        return 'Provider is on the way';
      case 'arrived':
        return 'Provider has arrived';
      case 'in_progress':
        return 'Service in progress';
      case 'completed':
        return 'Service completed';
      default:
        return 'Unknown status';
    }
  };

  const renderProviderCard = () => {
    if (!activeRequest.provider) return null;

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
              onPress={() => {/* TODO: Implement call */}}
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
        <Text variant="titleLarge" style={styles.emptyText}>No Active Requests</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: activeRequest.provider?.location.latitude || 37.7749,
          longitude: activeRequest.provider?.location.longitude || -122.4194,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {activeRequest.provider && (
          <Marker
            coordinate={activeRequest.provider.location}
            title={activeRequest.provider.name}
          >
            <MaterialCommunityIcons
              name="car-connected"
              size={32}
              color={getStatusColor()}
            />
          </Marker>
        )}
      </MapView>

      <View style={styles.content}>
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

        {renderProviderCard()}
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
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    padding: 20,
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
}); 