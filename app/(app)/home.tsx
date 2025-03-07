import { View, StyleSheet, ScrollView, Image,ActivityIndicator, Alert } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { router, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useServiceStore from '@/stores/serviceStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import {getActiveRequestData, refreshServiceForUser} from "@/lib/api/service"
import { updateLocation } from '@/lib/api/provider';

export default function HomeScreen() {
  const theme = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { services, fetchServices, setSelectedService } = useServiceStore();

  const router = useRouter();
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      await fetchServices();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
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

  
  useEffect(() => {
    const checkActiveRequest = async () => {
      try {
        
        const res = await refreshServiceForUser();

        if(res.status ===200){
          router.push(`/active-requests?id=${res.data.id}`);
        }

      } catch (error) {
        console.error('Error checking active request:', error);
      }
    };

    const interval = setInterval(checkActiveRequest, 10000);
    return () => clearInterval(interval);
  }, []);


  const onServiceSelect = (service : any) => {
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
    <SafeAreaView style={styles.container}>
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
        {services?.length > 0 ? services.map((service) => (
          <Card
            key={service.id}
            style={styles.serviceCard}
            onPress={() => onServiceSelect(service)}
          >
            <Card.Content style={styles.serviceCardContent}>
              <Image
                source={{ uri: service.image }}
                style={{ width: 40, height: 40 }}
              />
              <Text variant="titleMedium" style={styles.serviceTitle}>
                {service.title}
              </Text>
              <Text variant="bodySmall" style={styles.serviceDescription}>
                {service.description}
              </Text>
            </Card.Content>
          </Card>
        )) : (
          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Card style={[styles.serviceCard, {backgroundColor: '#f5f5f5'}]}>
              <Card.Content style={styles.serviceCardContent}>
                <View style={{width: 40, height: 40, backgroundColor: '#e0e0e0', borderRadius: 20}} />
                <View style={{width: '80%', height: 20, backgroundColor: '#e0e0e0', marginTop: 8, borderRadius: 4}} />
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    bottom: 40,
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