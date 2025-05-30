import { View, StyleSheet, FlatList, Image, Alert, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, useTheme, Portal, Modal } from 'react-native-paper';
import { useEffect, useState, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getActiveRequests } from '@/lib/api/provider';
import { acceptOrDeclineRequset } from '@/lib/api/service';
import { useRouter } from 'expo-router';
type ServiceRequest = {
  id: number;
  status: 'PendingProviderApproved';
  price: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    current_location: null | {
      latitude: number;
      longitude: number;
    };
  };
  service: {
    name:string;
    image:string;
  }
};

export default function RequestsScreen() {
  const theme = useTheme();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null)
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial load
    loadRequests();
    
    // Set up the refresh interval (every 30 seconds)
    refreshInterval.current = setInterval(() => {
      loadRequests();
    }, 30000);
    
    // Clean up on component unmount
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await getActiveRequests();
      setRequests(res.data);
    } catch (error) {
      Alert.alert('خطأ', 'فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const refreshHistory = async () => {
    try {
      setRefreshing(true);
      const res = await getActiveRequests();
      setRequests(res.data);
    } catch (error) {
      Alert.alert('خطأ', 'فشل تحديث الطلبات');
    } finally {
      setRefreshing(false);
    }
  };

  const getServiceIcon = () => {
    return 'car-wrench' as const;
  };

  const handleAcceptRequest = async (request: ServiceRequest) => {
    const res = await acceptOrDeclineRequset(request.id,'approved');
    if(res.status == 201){
      router.push(`/active-requests?id=${res.data.id}`);
    }
    
  };

  const handleDeclineRequest = async (request: ServiceRequest) => {
    try {
      const res = await acceptOrDeclineRequset(request.id, 'declined');
      if (res.status === 201) {
        // Remove the declined request from the list
        setRequests((prev) => prev ? prev.filter(r => r.id !== request.id) : null);
        Alert.alert('نجاح', 'تم رفض الطلب بنجاح');
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل رفض الطلب');
    }
  };

  const renderRequestCard = ({ item }: { item: ServiceRequest }) => (
    <Card style={styles.requestCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.serviceInfo}>
              <Image
                style={{width:25, height: 25, resizeMode: 'contain'}}
                source={{uri: item.service.image}}
              />
            <Text variant="titleMedium" style={styles.serviceType}>
              نوع الخدمة: {item.service.name}
            </Text>

            
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#DCFCE7',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            gap: 4
          }}>
            <MaterialCommunityIcons 
              size={20}
              name='cash'
              color='#16A34A'
            />
            <Text variant="titleMedium" style={{
              color: '#16A34A',
              fontWeight: '600',
            }}>
              ${item.price}
            </Text>
          </View>
        </View>

        {item.user.current_location && (
          <View style={styles.locationInfo}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color="#6B7280"
            />
            <Text variant="bodyMedium" style={styles.address} numberOfLines={1}>
              {`${item.user.current_location.latitude}, ${item.user.current_location.longitude}`}
            </Text>
          </View>
        )}

        <View style={styles.customerInfo}>
          <View style={styles.customerDetails}>
            <Text variant="bodyMedium">{item.user.name}</Text>
            <Text variant="bodySmall" style={styles.customerContact}>
              {item.user.phone}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => handleAcceptRequest(item)}
            style={styles.acceptButton}
          >
            قبول الطلب
          </Button>
          <Button
            mode="outlined"
            style={{borderColor: 'red'}}
            onPress={() => handleDeclineRequest(item)}
          >
            رفض
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
              <Text variant="headlineSmall">تفاصيل الطلب</Text>
              <MaterialCommunityIcons
                name={getServiceIcon()}
                size={24}
                color={theme.colors.primary}
              />
            </View>

            {selectedRequest.user.current_location && (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: selectedRequest.user.current_location.latitude,
                  longitude: selectedRequest.user.current_location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: selectedRequest.user.current_location.latitude,
                    longitude: selectedRequest.user.current_location.longitude,
                  }}
                />
              </MapView>
            )}

            <View style={styles.detailsContent}>
              <Text variant="titleMedium">معلومات العميل</Text>
              <Text variant="bodyLarge" style={styles.detailText}>
                {selectedRequest.user.name}
              </Text>
              <Text variant="bodyMedium" style={styles.detailText}>
                {selectedRequest.user.phone}
              </Text>
              <Text variant="bodyMedium" style={styles.detailText}>
                {selectedRequest.user.email}
              </Text>

              <Text variant="titleMedium" style={styles.detailLabel}>الحالة</Text>
              <Text variant="bodyLarge" style={styles.detailText}>
                {selectedRequest.status === 'PendingProviderApproved' ? 'في انتظار موافقة المزود' : selectedRequest.status}
              </Text>

              <Button
                mode="contained"
                onPress={() => {
                  handleAcceptRequest(selectedRequest);
                  setDetailsVisible(false);
                }}
                style={styles.modalAcceptButton}
              >
                قبول الطلب
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequestCard}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshHistory} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={64}
              color="#9CA3AF"
            />
            <Text variant="titleLarge" style={styles.emptyText}>
              لا توجد طلبات متاحة
            </Text>
          </View>
        }
      />
      {renderRequestDetails()}
    </SafeAreaView>
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
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerDetails: {
    flexDirection: 'column',
  },
  customerContact: {
    color: '#6B7280',
    marginTop: 4,
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
  modalAcceptButton: {
    marginTop: 24,
  },
});