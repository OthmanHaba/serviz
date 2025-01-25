import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, ProgressBar, useTheme, Card } from 'react-native-paper';
import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ServiceDetails = {
  vehicleType?: string;
  fuelType?: string;
  quantity?: string;
  issueDescription?: string;
};

export default function RequestServiceScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{
    serviceId: string;
    latitude: string;
    longitude: string;
  }>();

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<ServiceDetails>({});
  const totalSteps = 4;

  const getServiceIcon = () => {
    switch (params.serviceId) {
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

  const getServiceTitle = () => {
    switch (params.serviceId) {
      case 'towing':
        return 'Towing Service';
      case 'gas':
        return 'Gas Delivery';
      case 'mechanic':
        return 'Mobile Mechanic';
      default:
        return 'Service';
    }
  };

  const renderServiceDetails = () => {
    switch (params.serviceId) {
      case 'towing':
        return (
          <TextInput
            label="Vehicle Type"
            value={details.vehicleType}
            onChangeText={(text) => setDetails({ ...details, vehicleType: text })}
            style={styles.input}
          />
        );
      case 'gas':
        return (
          <>
            <TextInput
              label="Fuel Type"
              value={details.fuelType}
              onChangeText={(text) => setDetails({ ...details, fuelType: text })}
              style={styles.input}
            />
            <TextInput
              label="Quantity (Liters)"
              value={details.quantity}
              onChangeText={(text) => setDetails({ ...details, quantity: text })}
              keyboardType="numeric"
              style={styles.input}
            />
          </>
        );
      case 'mechanic':
        return (
          <TextInput
            label="Issue Description"
            value={details.issueDescription}
            onChangeText={(text) => setDetails({ ...details, issueDescription: text })}
            multiline
            numberOfLines={4}
            style={styles.input}
          />
        );
      default:
        return null;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text variant="titleLarge" style={styles.stepTitle}>Confirm Service Type</Text>
            <Card style={styles.serviceCard}>
              <Card.Content style={styles.serviceCardContent}>
                <MaterialCommunityIcons
                  name={getServiceIcon()}
                  size={48}
                  color={theme.colors.primary}
                />
                <Text variant="headlineSmall" style={styles.serviceTitle}>
                  {getServiceTitle()}
                </Text>
              </Card.Content>
            </Card>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text variant="titleLarge" style={styles.stepTitle}>Confirm Location</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: parseFloat(params.latitude || '0'),
                longitude: parseFloat(params.longitude || '0'),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(params.latitude || '0'),
                  longitude: parseFloat(params.longitude || '0'),
                }}
                draggable
              />
            </MapView>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text variant="titleLarge" style={styles.stepTitle}>Service Details</Text>
            {renderServiceDetails()}
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text variant="titleLarge" style={styles.stepTitle}>Confirmation</Text>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleMedium">Service Type:</Text>
                <Text style={styles.summaryText}>{getServiceTitle()}</Text>
                
                <Text variant="titleMedium" style={styles.summaryLabel}>Location:</Text>
                <Text style={styles.summaryText}>Current Location</Text>
                
                <Text variant="titleMedium" style={styles.summaryLabel}>Estimated Price:</Text>
                <Text style={styles.summaryText}>$50 - $100</Text>
              </Card.Content>
            </Card>
          </View>
        );
      default:
        return null;
    }
  };

  const onSubmit = async () => {
    try {
      // TODO: Implement API call to create service request
      router.push('/active-requests');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <ProgressBar
        progress={step / totalSteps}
        color={theme.colors.primary}
        style={styles.progressBar}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {renderStep()}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {step > 1 && (
          <Button
            mode="outlined"
            onPress={() => setStep(step - 1)}
            style={styles.button}
          >
            Back
          </Button>
        )}
        
        {step < totalSteps ? (
          <Button
            mode="contained"
            onPress={() => setStep(step + 1)}
            style={[styles.button, step === 1 && styles.singleButton]}
          >
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={onSubmit}
            style={styles.button}
          >
            Confirm Request
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressBar: {
    marginVertical: 10,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  serviceCard: {
    marginVertical: 20,
  },
  serviceCardContent: {
    alignItems: 'center',
    padding: 20,
  },
  serviceTitle: {
    marginTop: 10,
  },
  map: {
    height: 300,
    marginVertical: 20,
    borderRadius: 10,
  },
  input: {
    marginBottom: 15,
  },
  summaryCard: {
    marginVertical: 20,
  },
  summaryLabel: {
    marginTop: 15,
  },
  summaryText: {
    marginTop: 5,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  singleButton: {
    marginHorizontal: 0,
  },
}); 