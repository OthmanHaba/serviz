import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import {
  Text,
  Avatar,
  List,
  Switch,
  Button,
  Card,
  IconButton,
  useTheme,
  Divider,
} from 'react-native-paper';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Vehicle = {
  id: string;
  type: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
};

type PaymentMethod = {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  expiryDate?: string;
  email?: string;
};

export default function ProfileScreen() {
  const theme = useTheme();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);

  const [vehicles] = useState<Vehicle[]>([
    {
      id: '1',
      type: 'Sedan',
      make: 'Toyota',
      model: 'Camry',
      year: '2020',
      licensePlate: 'ABC123',
    },
    {
      id: '2',
      type: 'SUV',
      make: 'Honda',
      model: 'CR-V',
      year: '2019',
      licensePlate: 'XYZ789',
    },
  ]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      expiryDate: '12/24',
    },
    {
      id: '2',
      type: 'paypal',
      email: 'user@example.com',
    },
  ]);

  const renderVehicleCard = (vehicle: Vehicle) => (
    <Card key={vehicle.id} style={styles.vehicleCard}>
      <Card.Content>
        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleInfo}>
            <MaterialCommunityIcons
              name="car"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.vehicleDetails}>
              <Text variant="titleMedium">
                {vehicle.make} {vehicle.model}
              </Text>
              <Text variant="bodySmall" style={styles.vehicleSubtext}>
                {vehicle.year} • {vehicle.type}
              </Text>
            </View>
          </View>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => {/* TODO: Implement edit vehicle */}}
          />
        </View>
        <Text variant="bodySmall" style={styles.licensePlate}>
          License Plate: {vehicle.licensePlate}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderPaymentMethod = (method: PaymentMethod) => (
    <List.Item
      key={method.id}
      title={method.type === 'card' ? `•••• ${method.last4}` : method.email}
      description={method.type === 'card' ? `Expires ${method.expiryDate}` : 'PayPal'}
      left={props => (
        <List.Icon
          {...props}
          icon={method.type === 'card' ? 'credit-card' : 'paypal'}
        />
      )}
      right={props => <List.Icon {...props} icon="chevron-right" />}
      onPress={() => {/* TODO: Implement payment method details */}}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Avatar.Text
          size={80}
          label="JD"
          style={styles.avatar}
        />
        <Text variant="headlineSmall" style={styles.name}>John Doe</Text>
        <Text variant="bodyLarge" style={styles.email}>john.doe@example.com</Text>
        <Button
          mode="outlined"
          onPress={() => {/* TODO: Implement edit profile */}}
          style={styles.editButton}
        >
          Edit Profile
        </Button>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Vehicles</Text>
        {vehicles.map(renderVehicleCard)}
        <Button
          mode="outlined"
          icon="plus"
          onPress={() => {/* TODO: Implement add vehicle */}}
          style={styles.addButton}
        >
          Add Vehicle
        </Button>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Payment Methods</Text>
        <Card>
          {paymentMethods.map(renderPaymentMethod)}
          <Button
            mode="outlined"
            icon="plus"
            onPress={() => {/* TODO: Implement add payment */}}
            style={styles.addPaymentButton}
          >
            Add Payment Method
          </Button>
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Settings</Text>
        <Card>
          <List.Item
            title="Dark Mode"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell-outline" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Location Tracking"
            left={props => <List.Icon {...props} icon="map-marker-outline" />}
            right={() => (
              <Switch
                value={locationTracking}
                onValueChange={setLocationTracking}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Language"
            description="English"
            left={props => <List.Icon {...props} icon="translate" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {/* TODO: Implement language selection */}}
          />
        </Card>
      </View>

      <Button
        mode="contained"
        icon="logout"
        onPress={() => router.replace('/login')}
        style={styles.logoutButton}
      >
        Log Out
      </Button>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    marginBottom: 12,
  },
  name: {
    marginBottom: 4,
  },
  email: {
    color: '#6B7280',
    marginBottom: 16,
  },
  editButton: {
    marginTop: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  vehicleCard: {
    marginBottom: 12,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleDetails: {
    marginLeft: 12,
  },
  vehicleSubtext: {
    color: '#6B7280',
  },
  licensePlate: {
    marginTop: 8,
    color: '#6B7280',
  },
  addButton: {
    marginTop: 8,
  },
  addPaymentButton: {
    margin: 16,
  },
  logoutButton: {
    margin: 16,
  },
  footer: {
    alignItems: 'center',
    padding: 16,
  },
  version: {
    color: '#6B7280',
  },
}); 