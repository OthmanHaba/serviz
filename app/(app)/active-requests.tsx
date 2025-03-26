import { View, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { Text, Card, Button, Avatar, IconButton } from 'react-native-paper';
import { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getActiveRequestData } from "@/lib/api/service"
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { completeActiveRequest } from '@/lib/api/request';

/** types
 * 
 * @returns 
 * type Provider = {
  id: string;
  name: string;
  rating: number;
  phone: string;
  current_location: {
    latitude: number;
    longitude: number;
  };
};

type User = {
  id:string;
  name:string;
  current_location: {
    latitude: number;
    longitude: number;
  };
}

type ServiceRequest = {
  id: string;
  status: 'pending' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed';
  serviceType: string;
  provider?: Provider;
  user:User;
  createdAt: string;
  estimatedArrival?: string;
};

 */

export default function ActiveRequestsScreen() {
  const [activeRequest, setActiveRequest] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    (async () => {
      const res = await getActiveRequestData(Number(params.id));
      console.log(res.data);
      setActiveRequest(res.data);
    })();
  }, [])

  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  useEffect(() => {
    const statusUpdateInterval = setInterval(async () => {
      const res = await getActiveRequestData(Number(params.id));
      console.log(res.data);
      setActiveRequest(res.data);
    }, 10000);

    return () => {
      clearInterval(statusUpdateInterval);
    };
  }, [params.id]);

  const getStatusColor = () => {
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
        <Text variant="titleLarge" style={styles.emptyText}>No Active Requests</Text>
      </View>
    );
  }

  const handleComplete = async () => {
    
    setIsLoading(true);

    await completeActiveRequest(activeRequest.id).then(res => {
      setIsLoading(false);
      Alert.alert('request completed successfully');
      router.back()
    }).catch(e => {
      console.error(e);
    })
    .finally(() => {
      setIsLoading(false);
    });

  }

  return (
    <View style={styles.container}>
      <MapView
        // provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: activeRequest.provider?.current_location.latitude || 37.7749,
          longitude: activeRequest.provider?.current_location.longitude || -122.4194,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {activeRequest?.provider && (
          <Marker
            key={activeRequest.provider.id}
            coordinate={activeRequest.provider.current_location}
            title={activeRequest.provider.name}
          >
            <MaterialCommunityIcons name="car-connected" size={32} color={'red'} />
          </Marker>
        )}
        {activeRequest?.user?.current_location && (
          <Marker
            key={activeRequest.user.id}
            coordinate={activeRequest.user.current_location}
            title={activeRequest.user.name}
          >
            <MaterialCommunityIcons name="account" size={32} color="#FF5733" />
          </Marker>
        )}
      </MapView>

      <View style={styles.content}>
        {(user.role === 'provider') && 
        <View style={styles.statusCard}>
          <View>
            <Button mode="contained" onPress={() => handleComplete()} style={{ marginTop: 10 }}>
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


        {renderProviderCard()}
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