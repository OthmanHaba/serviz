import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Chip, useTheme, Portal, Modal } from 'react-native-paper';
import { useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ServiceRequest = {
  id: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  serviceType: string;
  distance: number;
  estimatedEarnings: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  customer: {
    name: string;
    rating: number;
  };
  description?: string;
};

const mockRequests: ServiceRequest[] = [
  {
    id: '1',
    status: 'pending',
    serviceType: 'towing',
    distance: 2.5,
    estimatedEarnings: 85.00,
    location: {
      latitude: 37.7849,
      longitude: -122.4194,
      address: '123 Main St, San Francisco, CA',
    },
    customer: {
      name: 'John Doe',
      rating: 4.8,
    },
    description: 'Vehicle needs to be towed to nearest repair shop',
  },
  {
    id: '2',
    status: 'pending',
    serviceType: 'gas',
    distance: 1.8,
    estimatedEarnings: 45.00,
    location: {
      latitude: 37.7899,
      longitude: -122.4174,
      address: '456 Market St, San Francisco, CA',
    },
    customer: {
      name: 'Jane Smith',
      rating: 4.9,
    },
    description: 'Out of gas, need 5 gallons of regular unleaded',
  },
];

export default function RequestsScreen() {
  const theme = useTheme();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'towing':
        return 'tow-truck';
      case 'gas':
        return 'gas-station';
      case 'mechanic':
        return 'wrench';
      default:
        return 'help';
    }
  };

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)} mi`;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleAcceptRequest = (request: ServiceRequest) => {
    // TODO: Implement accept request logic
    console.log('Accepting request:', request.id);
  };

  const renderRequestCard = ({ item }: { item: ServiceRequest }) => (
    <Card style={styles.requestCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.serviceInfo}>
            <MaterialCommunityIcons
              name={getServiceIcon(item.serviceType)}
              size={24}
              color={theme.colors.primary}
            />
            <Text variant="titleMedium" style={styles.serviceType}>
              {item.serviceType.charAt(0).toUpperCase() + item.serviceType.slice(1)}
            </Text>
          </View>
          <Chip icon="cash">{formatCurrency(item.estimatedEarnings)}</Chip>
        </View>

        <View style={styles.locationInfo}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color="#6B7280"
          />
          <Text variant="bodyMedium" style={styles.address} numberOfLines={1}>
            {item.location.address}
          </Text>
          <Text variant="bodyMedium" style={styles.distance}>
            {formatDistance(item.distance)}
          </Text>
        </View>

        <View style={styles.customerInfo}>
          <View style={styles.customerDetails}>
            <Text variant="bodyMedium">{item.customer.name}</Text>
            <View style={styles.rating}>
              <MaterialCommunityIcons name="star" size={16} color="#FCD34D" />
              <Text variant="bodySmall">{item.customer.rating}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => handleAcceptRequest(item)}
            style={styles.acceptButton}
          >
            Accept Request
          </Button>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedRequest(item);
              setDetailsVisible(true);
            }}
          >
            View Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRequestDetails = () => (
    <Portal>
      <Modal
        visible={detailsVisible}
        onDismiss={() => setDetailsVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        {selectedRequest && (
          <View>
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall">Request Details</Text>
              <MaterialCommunityIcons
                name={getServiceIcon(selectedRequest.serviceType)}
                size={24}
                color={theme.colors.primary}
              />
            </View>

            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: selectedRequest.location.latitude,
                longitude: selectedRequest.location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: selectedRequest.location.latitude,
                  longitude: selectedRequest.location.longitude,
                }}
              />
            </MapView>

            <View style={styles.detailsContent}>
              <Text variant="titleMedium">Service Type</Text>
              <Text variant="bodyLarge" style={styles.detailText}>
                {selectedRequest.serviceType.charAt(0).toUpperCase() + 
                 selectedRequest.serviceType.slice(1)}
              </Text>

              <Text variant="titleMedium" style={styles.detailLabel}>Location</Text>
              <Text variant="bodyLarge" style={styles.detailText}>
                {selectedRequest.location.address}
              </Text>

              <Text variant="titleMedium" style={styles.detailLabel}>Description</Text>
              <Text variant="bodyLarge" style={styles.detailText}>
                {selectedRequest.description || 'No description provided'}
              </Text>

              <Text variant="titleMedium" style={styles.detailLabel}>Estimated Earnings</Text>
              <Text variant="headlineSmall" style={styles.earnings}>
                {formatCurrency(selectedRequest.estimatedEarnings)}
              </Text>

              <Button
                mode="contained"
                onPress={() => {
                  handleAcceptRequest(selectedRequest);
                  setDetailsVisible(false);
                }}
                style={styles.modalAcceptButton}
              >
                Accept Request
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockRequests}
        renderItem={renderRequestCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={64}
              color="#9CA3AF"
            />
            <Text variant="titleLarge" style={styles.emptyText}>
              No Requests Available
            </Text>
          </View>
        }
      />
      {renderRequestDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  requestCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceType: {
    marginLeft: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    flex: 1,
    marginLeft: 4,
    color: '#6B7280',
  },
  distance: {
    marginLeft: 8,
    color: '#6B7280',
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    color: '#6B7280',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  map: {
    height: 200,
  },
  detailsContent: {
    padding: 16,
  },
  detailLabel: {
    marginTop: 16,
  },
  detailText: {
    marginTop: 4,
    color: '#6B7280',
  },
  earnings: {
    marginTop: 4,
  },
  modalAcceptButton: {
    marginTop: 24,
  },
}); 