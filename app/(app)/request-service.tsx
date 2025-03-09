import { View, StyleSheet, ScrollView, SafeAreaView, Image, Alert } from 'react-native';
import { Text, Button, TextInput, ProgressBar, useTheme, Card } from 'react-native-paper';
import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import useServiceStore from '@/stores/serviceStore';
import { ActiveRequest, LockUpRequest } from '@/types';
import { lockup, userApproveActiveRequest } from "@/lib/api/service"
import { Provider } from "@/types"


export default function RequestServiceScreen() {
  const theme = useTheme();
  const { selectedService } = useServiceStore();
  const params = useLocalSearchParams<{
    latitude: string;
    longitude: string;
  }>();

  const [notFound, setNotFound] = useState<Boolean>(false)
  const [provider, setProvider] = useState<Provider | null>(null);
  const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(null)
  const [loadingLockup, setLoadingLockup] = useState<boolean>(false)
  const [notFoundMessage, setNotFoundMessage] = useState("")
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [price, setPrice] = useState(0);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <SafeAreaView style={styles.stepContainer}>
            <Text variant="titleLarge" style={styles.stepTitle}>Confirm Service Type</Text>
            <Card style={styles.serviceCard}>
              <Card.Content style={styles.serviceCardContent}>
                <Image
                  source={{ uri: selectedService?.image }}
                  style={{ width: 48, height: 48 }}
                  resizeMode="contain"
                />
                <Text variant="headlineSmall" style={styles.serviceTitle}>
                  {selectedService?.name}
                </Text>
              </Card.Content>
            </Card>
          </SafeAreaView>
        );
      case 2:
        return (
          <SafeAreaView style={styles.stepContainer}>
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
          </SafeAreaView>
        );
      case 3:
        return !notFound ? (
          <SafeAreaView style={styles.stepContainer}>
            <Text variant="titleLarge" style={styles.stepTitle}>Confirmation</Text>
            <Card style={styles.summaryCard}>
              <Card.Content>

                <Text variant="titleMedium">Service Type:</Text>
                <Text style={styles.summaryText}>{selectedService?.name}</Text>

                {/* <Text variant="titleMedium" style={styles.summaryLabel}>Location:</Text>
                <Text style={styles.summaryText}>Current Location</Text> */}

                <Text variant="titleMedium" style={styles.summaryLabel}>Estimated Price:</Text>
                <Text style={styles.summaryText}>{activeRequest?.price}</Text>
              </Card.Content>
            </Card>
          </SafeAreaView>
        ) : (
          <View style={styles.stepContainer}>
            <Text variant="titleLarge" style={styles.stepTitle}>No Service Available</Text>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryText}>
                  {notFoundMessage}
                  {/* Sorry, there are no service providers available in your area at this time. Please try again later. */}
                </Text>
              </Card.Content>
            </Card>
          </View>
        );
      default:
        return null;
    }
  };

  const getEstimatedPrice = async () => {

    if (!selectedService) {
      return;
    }
    try {

      const data = {
        service_id: selectedService.id,
        coordinate: {
          latitude: params.latitude,
          longitude: params.longitude,
        }
      }

      const res = await lockup(data);

      if (res.status == 203) {
        setNotFound(true);
        setNotFoundMessage(res.data.message);
        Alert.alert(res.data.message);
      }
      else if (res.status == 201) {
        console.log(res.data);
        setProvider(res.data.provider);
        setActiveRequest(res.data.active_request);
        setNotFound(false);
      }
      setStep(step + 1);


    } catch (e) {
      console.error(e);
    }


  };
  const onSubmit = async () => {
    try {
      if (!activeRequest) {
        return;
      }
      const res = await userApproveActiveRequest(activeRequest?.id);
      console.log(res);
      router.push(`/active-requests?id=${activeRequest?.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            onPress={step === 2 ? getEstimatedPrice : () => setStep(step + 1)}
            style={[styles.button, step === 1 && styles.singleButton]}
          >
            Next
          </Button>
        ) : !notFound && (
          <Button
            mode="contained"
            onPress={onSubmit}
            style={styles.button}
          >
            Confirm Request
          </Button>
        )}
      </View>
    </SafeAreaView>
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