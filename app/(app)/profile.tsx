import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import {
  Text,
  Avatar,
  Button,
  useTheme,
  Surface,
  Divider,
  Modal,
  Portal,
  TextInput,
  IconButton,
  MD3Theme,
} from 'react-native-paper';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { profile, addProviderService, deleteProviderService } from '@/lib/api/provider';
import useServiceStore, { Service } from '@/stores/serviceStore';
import * as ReactNativePaper from 'react-native-paper';
import React from 'react';

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
    id?: number;
    service: number;
    price: string;
    servic_type_id: number;
    service_type: {
      name: string;
      id?: number;
    };
  }[];
}

type ServiceType = {
  id: number;
  name: string;
  price: number;
};

// Define props interface for the modal content component
interface ServiceModalContentProps {
  theme: MD3Theme;
  services: Service[];
  selectedServiceType: ServiceType | null;
  setSelectedServiceType: (serviceType: ServiceType) => void;
  servicePrice: string;
  handlePriceChange: (text: string) => void;
  addServiceError: string | null;
  handleAddService: () => Promise<void>;
  addingService: boolean;
  loadingServiceTypes: boolean;
}

// Create a separate optimized component for the price input
const PriceInput = React.memo(({ 
  value, 
  onChangeText 
}: { 
  value: string; 
  onChangeText: (text: string) => void 
}) => {
  return (
    <TextInput
      mode="outlined"
      value={value}
      onChangeText={onChangeText}
      placeholder="أدخل السعر"
      keyboardType="numeric"
      style={styles.priceInput}
      maxLength={10}
      autoComplete="off"
      returnKeyType="done"
      autoCapitalize="none"
      dense={true}
      clearTextOnFocus={true}
      enablesReturnKeyAutomatically={true}
      importantForAutofill="no"
    />
  );
});

// Create a separate component for the service modal content
const ServiceModalContent = ({ 
  theme, 
  services, 
  selectedServiceType, 
  setSelectedServiceType, 
  servicePrice, 
  handlePriceChange,
  addServiceError,
  handleAddService,
  addingService,
  loadingServiceTypes
}: ServiceModalContentProps) => {
  
  const serviceList = useMemo(() => {
    return services.map((service) => (
      <TouchableOpacity
        key={service.id}
        onPress={() => setSelectedServiceType({
          id: service.id,
          name: service.name,
          price: 0
        })}
      >
        <Surface
          style={[
            styles.serviceTypeItem,
            selectedServiceType?.id === service.id && styles.selectedServiceType
          ]}
        >
          <Text
            style={[
              styles.serviceTypeName,
              selectedServiceType?.id === service.id && styles.selectedServiceTypeName
            ]}
          >
            {service.name}
          </Text>
          {selectedServiceType?.id === service.id && (
            <MaterialCommunityIcons
              name="check"
              size={24}
              color={theme.colors.primary}
            />
          )}
        </Surface>
      </TouchableOpacity>
    ));
  }, [services, selectedServiceType, theme.colors.primary]);

  if (loadingServiceTypes) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text>جاري تحميل أنواع الخدمات...</Text>
      </View>
    );
  }

  return (
    <View>
      <Text variant="bodyMedium" style={styles.modalLabel}>اختر نوع الخدمة</Text>
      <ScrollView style={styles.serviceTypeList}>
        {serviceList}
      </ScrollView>

      <Text variant="bodyMedium" style={styles.modalLabel}>السعر ($)</Text>
      <PriceInput
        value={servicePrice}
        onChangeText={handlePriceChange}
      />

      {addServiceError && (
        <Text style={styles.errorText}>{addServiceError}</Text>
      )}

      <Button
        mode="contained"
        onPress={handleAddService}
        style={styles.addButton}
        loading={addingService}
        disabled={addingService}
      >
        إضافة خدمة
      </Button>
    </View>
  );
};

export default function ProfileScreen() {
  const theme = useTheme();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [servicePrice, setServicePrice] = useState('');
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(false);
  const [addingService, setAddingService] = useState(false);
  const [addServiceError, setAddServiceError] = useState<string | null>(null);
  
  // Integrate service store
  const { services, fetchServices } = useServiceStore();

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
      setError('فشل تحميل الملف الشخصي. يرجى المحاولة مرة أخرى.');
      console.error('Profile loading error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const fetchServiceTypes = async () => {
    try {
      setLoadingServiceTypes(true);
      setAddServiceError(null);
      await fetchServices();
    } catch (err) {
      setAddServiceError('فشل تحميل أنواع الخدمات. يرجى المحاولة مرة أخرى.');
      console.error('Service types loading error:', err);
    } finally {
      setLoadingServiceTypes(false);
    }
  };

  const handleOpenServiceModal = () => {
    setServiceModalVisible(true);
    fetchServiceTypes();
    setSelectedServiceType(null);
    setServicePrice('');
  };

  const handleCloseServiceModal = () => {
    setServiceModalVisible(false);
    setAddServiceError(null);
  };

  // Optimize price change handler with useCallback
  const handlePriceChange = useCallback((text: string) => {
    // Only allow numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(text)) {
      setServicePrice(text);
    }
  }, []);

  const handleAddService = async () => {
    if (!selectedServiceType) {
      setAddServiceError('الرجاء اختيار نوع الخدمة');
      return;
    }

    if (!servicePrice || isNaN(Number(servicePrice)) || Number(servicePrice) <= 0) {
      setAddServiceError('الرجاء إدخال سعر صالح');
      return;
    }

    try {
      setAddingService(true);
      setAddServiceError(null);
      await addProviderService(selectedServiceType.id, servicePrice);
      await loadProfile();
      handleCloseServiceModal();
    } catch (err) {
      setAddServiceError('فشل إضافة الخدمة. يرجى المحاولة مرة أخرى.');
      console.error('Add service error:', err);
    } finally {
      setAddingService(false);
    }
  };

  const handleDeleteService = async (serviceId: number | undefined) => {
    if (!serviceId) return;
    
    try {
      await deleteProviderService(serviceId);
      await loadProfile();
    } catch (err) {
      console.error('Delete service error:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>جاري تحميل الملف الشخصي...</Text>
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
          إعادة المحاولة
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Portal>
        <Modal
          visible={serviceModalVisible}
          onDismiss={handleCloseServiceModal}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text variant="titleLarge">إضافة أو تعديل خدمة</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={handleCloseServiceModal}
            />
          </View>
          <Divider style={styles.divider} />
          
          <ServiceModalContent
            theme={theme}
            services={services}
            selectedServiceType={selectedServiceType}
            setSelectedServiceType={setSelectedServiceType}
            servicePrice={servicePrice}
            handlePriceChange={handlePriceChange}
            addServiceError={addServiceError}
            handleAddService={handleAddService}
            addingService={addingService}
            loadingServiceTypes={loadingServiceTypes}
          />
        </Modal>
      </Portal>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
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
              {userProfile.role === 'provider' ? 'مزود خدمة' : 'مستخدم'}
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
            <Text variant="titleMedium" style={styles.sectionTitle}>رصيد المحفظة</Text>
          </View>
          <Text variant="displaySmall" style={styles.balance}>
            ${userProfile?.wallet?.balance ?? '0'}
          </Text>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="car" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>معلومات السيارة</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.vehicleDetails}>
            {userProfile.vehicle_info && typeof userProfile.vehicle_info === 'object' ? 
              Object.entries(
                typeof userProfile.vehicle_info === 'string' 
                  ? JSON.parse(userProfile.vehicle_info) 
                  : userProfile.vehicle_info
              ).map(([key, value]) => (
                <View key={key} style={styles.vehicleRow}>
                  <Text variant="bodyMedium" style={styles.vehicleLabel}>
                    {translateVehicleInfo(key)}
                  </Text>
                  <Text variant="bodyLarge">{value as string}</Text>
                </View>
              ))
              : <Text>لا توجد معلومات متاحة عن السيارة</Text>
            }
          </View>
        </Surface>

        {userProfile.provider_services && userProfile.provider_services.length > 0 && (
          <Surface style={styles.section} elevation={1}>
            <View style={{...styles.sectionHeader,justifyContent:'space-between'}}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="tools" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.sectionTitle}>الخدمات المقدمة</Text>
              </View>
              <Button
                mode="contained"
                onPress={handleOpenServiceModal}
                style={styles.actionButton}
              >
                <MaterialCommunityIcons name="plus" size={24} color={'white'} />
              </Button>
            </View>
            <Divider style={styles.divider} />
            {userProfile.provider_services?.map((service, index) => (
              <View key={index} style={styles.serviceRow}>
                <Text variant="bodyMedium">الخدمة #
                <Text style={{fontWeight:'bold', color:theme.colors.primary}}>
                {service.service_type.name}
                </Text>
                </Text>
                <View style={styles.serviceActions}>
                  <Text variant="bodyLarge" style={styles.servicePrice}>
                    ${service.price}
                  </Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor={theme.colors.error}
                    onPress={() => handleDeleteService(service.servic_type_id)}
                  />
                </View>
              </View>
            ))}
          </Surface>
        )}

        {(!userProfile.provider_services || userProfile.provider_services.length === 0) && userProfile.role === 'provider' && (
          <Surface style={styles.section} elevation={1}>
            <View style={{...styles.sectionHeader,justifyContent:'space-between'}}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="tools" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.sectionTitle}>الخدمات المقدمة</Text>
              </View>
              <Button
                mode="contained"
                onPress={handleOpenServiceModal}
                style={styles.actionButton}
              >
                <MaterialCommunityIcons name="plus" size={24} color={'white'} />
              </Button>
            </View>
            <Divider style={styles.divider} />
            <Text style={styles.emptyText}>لا توجد خدمات مقدمة حتى الآن. أضف خدمتك الأولى!</Text>
          </Surface>
        )}

        <View style={styles.actions}>
          <Button
            mode="outlined"
            icon="logout"
            onPress={() => router.replace('/login')}
            style={styles.actionButton}
          >
            تسجيل الخروج
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to translate vehicle information keys
function translateVehicleInfo(key: string): string {
  const translations: {[key: string]: string} = {
    'make': 'الشركة المصنعة',
    'model': 'الموديل',
    'year': 'السنة',
    'color': 'اللون',
    'license': 'رقم اللوحة',
    'type': 'النوع',
  };
  
  return translations[key] || key.charAt(0).toUpperCase() + key.slice(1);
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
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalLabel: {
    marginBottom: 12,
  },
  serviceTypeList: {
    maxHeight: 200,
  },
  serviceTypeItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedServiceType: {
    backgroundColor: '#e0e0e0',
  },
  serviceTypeName: {
    fontWeight: 'bold',
  },
  selectedServiceTypeName: {
    color: '#6200ee',
  },
  priceInput: {
    marginBottom: 12,
  },
  addButton: {
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 