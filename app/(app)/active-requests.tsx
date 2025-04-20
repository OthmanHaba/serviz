import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text, Card, Button, Avatar, IconButton, Portal, Modal } from 'react-native-paper';
import { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getActiveRequestData } from "@/lib/api/service"
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { completeActiveRequest } from '@/lib/api/request';
import { ServiceRequest } from '@/app/types/request';
import * as Location from 'expo-location';



export default function ActiveRequestsScreen() {
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [providerLocation, setProviderLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);



  useEffect(() => {
    (async () => {
      try {
        const requestId = typeof params.id === 'string' ? parseInt(params.id, 10) : Number(params.id);
        const res = await getActiveRequestData(requestId);
        console.log(res.data);
        setActiveRequest(res.data);
        setUserLocation({
          latitude: parseFloat(res.data.user.current_location.latitude),
          longitude: parseFloat(res.data.user.current_location.longitude),
          altitude: 0,
          accuracy: 0,
          altitudeAccuracy: 0,
          heading: 0,
          speed: 0,
        });
        setProviderLocation({
          latitude: parseFloat(res.data.provider.current_location.latitude),
          longitude: parseFloat(res.data.provider.current_location.longitude),
          altitude: 0,
          accuracy: 0,
          altitudeAccuracy: 0,
          heading: 0,
          speed: 0,
        });
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        console.error('خطأ في جلب بيانات الطلب:', error);
      }
    })();
  }, [params.id]);

  useEffect(() => {
    const statusUpdateInterval = setInterval(async () => {
      try {
        const requestId = typeof params.id === 'string' ? parseInt(params.id, 10) : Number(params.id);
        const res = await getActiveRequestData(requestId);
        setActiveRequest(res.data);
      } catch (error) {
        router.setParams({ id: null });
        router.push(
          user?.role === 'provider' 
          ? '/dashboard' 
          : '/home'
        );
        console.error('خطأ في تحديث بيانات الطلب:', error);
      }
    }, 4000);

    return () => {
      clearInterval(statusUpdateInterval);
    };
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
    if (!activeRequest) return 'جاري التحميل...';

    switch (activeRequest.status) {
      case 'PendingUserApproved':
        return 'بانتظار موافقتك...';
      case 'PendingProviderApproved':
        return 'بانتظار موافقة مزود الخدمة...';
      case 'InProgress':
        return 'الخدمة قيد التنفيذ';
      case 'Completed':
        return 'تم إكمال الخدمة';
      default:
        return 'حالة غير معروفة';
    }
  };

  const renderProviderCard = () => {
    if (!activeRequest || !activeRequest.provider) return null;

    return (
      <Card style={styles.providerCard} onPress={() => setShowProviderModal(true)}>
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

  const renderUserCard = () => {
    if (!activeRequest || !activeRequest.user) return null;

    return (
      <Card style={styles.userCard} onPress={() => setShowUserModal(true)}>
        <Card.Content style={styles.userContent}>
          <View style={styles.userInfo}>
            <Avatar.Text
              size={50  }
              label={activeRequest.user.name
                .split(' ')
                .map(n => n[0])
                .join('')}
            />
            <View style={styles.userDetails}>
              <Text variant="titleMedium">{activeRequest.user.name}</Text>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#FCD34D" />
                {/* <Text>{activeRequest.user.rating}</Text> */}
              </View>
            </View>
          </View>
          <View style={styles.userActions}>
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
        <Text variant="titleLarge" style={styles.emptyText}>لا توجد طلبات نشطة</Text>
      </View>
    );
  }

  const handleComplete = async () => {
    if (!activeRequest) return;

    setIsLoading(true);

    try {
      await completeActiveRequest(activeRequest.id);
      setIsLoading(false);
      Alert.alert('تم إكمال الطلب بنجاح');
      router.back();
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {location && <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onMapReady={() => setMapReady(true)}
      >
        {mapReady && (
          <View>
            {providerLocation && (
              <Marker
                coordinate={{
                  latitude: providerLocation.latitude,
                  longitude: providerLocation.longitude
                }}
                title={activeRequest.provider.name}
              >
                <MaterialCommunityIcons name="truck-flatbed" size={24} color="#1006F3" />
              </Marker>
            )}
            {userLocation && (
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude
                }}
                title={activeRequest.user.name || "المستخدم"}
              >
                <MaterialCommunityIcons name="account" size={32} color="#FF5733" />
              </Marker>
            )}
          </View>
        )}
      </MapView>
      }

      <View style={styles.content}>
        {user?.role === 'provider' &&
          <View style={styles.statusCard}>
            <View>
              <Button mode="contained" onPress={() => handleComplete()} style={{ marginTop: 10 }} loading={isLoading} disabled={isLoading}>
                إكمال
              </Button>
            </View>
          </View>
        }
        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Text variant="titleMedium">الحالة</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
            </View>
            {activeRequest.estimatedArrival && (
              <Text style={styles.eta}>
                الوصول المتوقع: {activeRequest.estimatedArrival}
              </Text>
            )}
          </Card.Content>
        </Card>


        {user?.role === 'user' && renderProviderCard()}
        {user?.role === 'provider' && renderUserCard()}

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

        <Portal>
          {/* Provider Details Modal */}
          <Modal 
            visible={showProviderModal} 
            onDismiss={() => setShowProviderModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            {activeRequest?.provider && (
              <View>
                <View style={styles.modalHeader}>
                  <Avatar.Text
                    size={80}
                    label={activeRequest.provider.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  />
                  <IconButton
                    icon="close"
                    size={24}
                    style={styles.closeButton}
                    onPress={() => setShowProviderModal(false)}
                  />
                </View>
                
                <View style={styles.modalContent}>
                  <Text variant="headlineSmall" style={styles.modalName}>{activeRequest.provider.name}</Text>
                  
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="star" size={20} color="#FCD34D" />
                    <Text variant="bodyLarge" style={styles.infoText}>{activeRequest.provider.rating} تقييم</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="phone" size={20} color="#4CAF50" />
                    <Text variant="bodyLarge" style={styles.infoText}>{activeRequest.provider.phone || 'غير متاح'}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker" size={20} color="#2196F3" />
                    <Text variant="bodyLarge" style={styles.infoText}>
                      {`${activeRequest.provider.current_location.latitude}, ${activeRequest.provider.current_location.longitude}`}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <Button 
                      mode="contained" 
                      icon="phone" 
                      style={styles.actionButton}
                      onPress={() => {/* TODO: Implement call */}}
                    >
                      اتصال
                    </Button>
                    <Button 
                      mode="outlined" 
                      icon="message" 
                      style={styles.actionButton}
                      onPress={() => {/* TODO: Implement message */}}
                    >
                      مراسلة
                    </Button>
                  </View>
                </View>
              </View>
            )}
          </Modal>

          {/* User Details Modal */}
          <Modal 
            visible={showUserModal} 
            onDismiss={() => setShowUserModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            {activeRequest?.user && (
              <View>
                <View style={styles.modalHeader}>
                  <Avatar.Text
                    size={80}
                    label={activeRequest.user.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  />
                  <IconButton
                    icon="close"
                    size={24}
                    style={styles.closeButton}
                    onPress={() => setShowUserModal(false)}
                  />
                </View>
                
                <View style={styles.modalContent}>
                  <Text variant="headlineSmall" style={styles.modalName}>{activeRequest.user.name}</Text>
                  
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="phone" size={20} color="#4CAF50" />
                    <Text variant="bodyLarge" style={styles.infoText}>{'غير متاح'}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="account" size={20} color="#2196F3" />
                    <Text variant="bodyLarge" style={styles.infoText}>{activeRequest.user.name}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker" size={20} color="#FF5722" />
                    <Text variant="bodyLarge" style={styles.infoText}>
                      {`${activeRequest.user.current_location.latitude}, ${activeRequest.user.current_location.longitude}`}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <Button 
                      mode="contained" 
                      icon="phone" 
                      style={styles.actionButton}
                      onPress={() => {/* TODO: Implement call */}}
                    >
                      اتصال
                    </Button>
                    <Button 
                      mode="outlined" 
                      icon="message" 
                      style={styles.actionButton}
                      onPress={() => {/* TODO: Implement message */}}
                    >
                      مراسلة
                    </Button>
                  </View>
                </View>
              </View>
            )}
          </Modal>
        </Portal>
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
  userCard: {
    marginBottom: 10,
  },
  userContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
  },
  userActions: {
    flexDirection: 'row',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 0,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  modalContent: {
    padding: 20,
  },
  modalName: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
}); 