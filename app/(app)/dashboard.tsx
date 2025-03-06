import { View, StyleSheet, ScrollView, Platform,SafeAreaView, Alert, Animated, TouchableOpacity } from 'react-native';
import { Text, Card, Switch, Button, useTheme, List } from 'react-native-paper';
import { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toggleActiveStatus, updateLocation } from '@/lib/api/provider';
import { useAuthStore } from '@/stores/authStore';
import { usePushNotification } from '@/hooks/usePushNotification';
import { updateExpoToken } from '@/lib/api/provider';
type DailyStats = {
  totalEarnings: number;
  completedRequests: number;
  totalHours: number;
  rating: number;
};

export default function DashboardScreen() {
  const theme = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useState(new Animated.Value(0))[0];
  const { user } = useAuthStore();



  const [todayStats] = useState<DailyStats>({
    totalEarnings: 185.50,
    completedRequests: 4,
    totalHours: 6,
    rating: 4.8,
  });

  // const {expoPushToken} = usePushNotification();

  // useEffect(() => {
  //   const updateToken = async () => {
  //     if (expoPushToken && isOnline) {
  //       // Send the push token to your backend when provider goes online
  //       try {
  //         await updateExpoToken(expoPushToken);
  //       } catch (error) {
  //         console.error('Error updating push token:', error);
  //       }
  //     }
  //   }

  //   updateToken();

  // }, [expoPushToken]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let locationUpdateInterval: NodeJS.Timeout | null = null;

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        // if(user){
        //   setIsOnline(user.is_active);
        // }

        // Get initial location
        let initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(initialLocation);

        // Update server with initial location
        if (isOnline) {
          await updateLocation(
            initialLocation.coords.latitude,
            initialLocation.coords.longitude
          );
        }

        // Start watching position
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000, // Update every 5 seconds
            distanceInterval: 10, // Update every 10 meters
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );

        // Set up interval to update server with location
        locationUpdateInterval = setInterval(async () => {
          if (isOnline && location) {
            try {
              await updateLocation(
                location.coords.latitude,
                location.coords.longitude
              );
            } catch (error) {
              console.error('Error updating location:', error);
            }
          }
        }, 30000); // Update server every 30 seconds

        setLocationSubscription(subscription);
      } catch (error) {
        setErrorMsg('Error accessing location services');
        console.error('Location error:', error);
      }
    })();

    // Cleanup subscription and interval on unmount
    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
      }
    };
  }, [isOnline]);

  const toggleOnlineStatus = async () => {
    try {
  await toggleActiveStatus(!isOnline).then(res => {
        setIsOnline(res.is_active);
      });
    } catch (error) {
      console.error('Error toggling active status:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const toggleAccordion = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{
        position: 'absolute',
        top: 60,
        right: 16,
        zIndex: 1,
        backgroundColor: '#FF4444',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        opacity: new Animated.Value(1),
        transform: [{
          scale: new Animated.Value(1)
        }],
      }}>
        <View style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#FFFFFF',
          marginRight: 8,
        }} />
        <Text style={{
          color: '#FFFFFF', 
          fontSize: 14,
          fontWeight: '600',
          letterSpacing: 0.3,
        }}>New Request Available</Text>
      </Animated.View>

      {location ? (
        <MapView
          provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
          style={styles.map}
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
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          >
            <View style={[styles.markerContainer, { backgroundColor: isOnline ? theme.colors.primary : '#6B7280' }]}>
              <MaterialCommunityIcons
                name="account-circle"
                size={24}
                color="white"
              />
            </View>
          </Marker>
        </MapView>
      ) : (
        <View style={styles.map}>
          <Text>{errorMsg || 'Loading map...'}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[
          styles.toggleButton,
          { backgroundColor: isOnline ? theme.colors.primary : '#6B7280' }
        ]}
        onPress={toggleOnlineStatus}
      >
        <MaterialCommunityIcons
          name={isOnline ? "toggle-switch" : "toggle-switch-off"}
          size={28}
          color="white"
        />
        <Text style={styles.toggleButtonText}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <List.Accordion
          title="Today's Overview"
          left={props => <List.Icon {...props} icon="calendar-today" />}
          style={styles.accordion}
          expanded={expanded}
          onPress={toggleAccordion}
        >
          <Animated.View style={[
            styles.statsGrid,
            {
              opacity: animatedHeight,
              transform: [{
                translateY: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                })
              }]
            }
          ]}>
            <Card style={styles.statCard}>
              <Card.Content>
                <MaterialCommunityIcons
                  name="cash"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text variant="titleLarge" style={styles.statValue}>
                  {formatCurrency(todayStats.totalEarnings)}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Earnings
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text variant="titleLarge" style={styles.statValue}>
                  {todayStats.completedRequests}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Completed
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <MaterialCommunityIcons
                  name="clock"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text variant="titleLarge" style={styles.statValue}>
                  {todayStats.totalHours}h
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Hours
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content>
                <MaterialCommunityIcons
                  name="star"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text variant="titleLarge" style={styles.statValue}>
                  {todayStats.rating}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Rating
                </Text>
              </Card.Content>
            </Card>
          </Animated.View>
        </List.Accordion>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
  toggleButton: {
    position: 'absolute',
    left: 16,
    top: 60,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  accordion: {
    backgroundColor: 'transparent',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
  },
  statValue: {
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#6B7280',
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