import React, { ScrollView, View, StyleSheet, Alert, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { TextInput, Button, Text, ProgressBar, RadioButton, Checkbox } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import useServiceStore from '@/stores/serviceStore';
import { RegisterService } from '@/lib/services/register';
import { MaterialIcons } from '@expo/vector-icons';
type Service = {
  id: number;
  name: string;
  image: string;
  description: string;
}

const registrationSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  name: z.string().optional(),
  password: z.string().min(6),
  vehicleType: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  role: z.enum(['user', 'provider']),
});


type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const { control, handleSubmit, watch, setValue } = useForm<RegistrationForm>();
  const { role } = useLocalSearchParams();
  const { services, fetchServices } = useServiceStore();
  const [selectedServices, setSelectedServices] = useState<{
    servic_type_id: number;
    price: number;
  }[]>([]);
  const [servicePrices, setServicePrices] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    setValue('role', role as 'user' | 'provider');
  }, [role]);

  useEffect(() => {
    fetchServices();
  }, []);

  const onSubmit = async (data: RegistrationForm) => {
    try {
      const registerService = new RegisterService();
      registerService.setUserInfo({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role
      });
      registerService.setServices(selectedServices);
      registerService.setVichaleInfo({
        vehicleType: data.vehicleType,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear
      });

      const response = await registerService.register();

      router.replace('/login');
    } catch (error: any) {
      console.error(error.response.data);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Controller
              control={control}
              name="name"
              rules={{ required: true }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextInput
                  label="Name"
                  value={value}
                  onChangeText={onChange}
                  error={!!error}
                  style={styles.input}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              rules={{ required: true }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  error={!!error}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              rules={{ required: true }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextInput
                  label="Phone Number"
                  value={value}
                  onChangeText={onChange}
                  error={!!error}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
              )}
            />
            <Controller
              control={control}
              name="role"
              rules={{ required: true }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <RadioButton.Group
                  onValueChange={onChange}
                  value={value}
                >
                  <RadioButton.Item label="User" value="user" />
                  <RadioButton.Item label="Provider" value="provider" />
                </RadioButton.Group>

              )}
            />

          </>
        );
      case 2:
        return (
          <Controller
            control={control}
            name="password"
            rules={{ required: true }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextInput
                label="Password"
                value={value}
                onChangeText={onChange}
                error={!!error}
                secureTextEntry
                style={styles.input}
              />
            )}
          />
        );
      case 3:
        return (
          <>
            <Controller
              control={control}
              name="vehicleType"
              rules={{ required: true }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextInput
                  label="Vehicle Type"
                  value={value}
                  onChangeText={onChange}
                  error={!!error}
                  style={styles.input}
                />
              )}
            />
            <Controller
              control={control}
              name="vehicleModel"
              rules={{ required: true }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextInput
                  label="Vehicle Model"
                  value={value}
                  onChangeText={onChange}
                  error={!!error}
                  style={styles.input}
                />
              )}
            />
            <Controller
              control={control}
              name="vehicleYear"
              rules={{ required: true }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextInput
                  label="Vehicle Year"
                  value={value}
                  onChangeText={onChange}
                  error={!!error}
                  style={styles.input}
                  keyboardType="numeric"
                />
              )}
            />
            {role === 'provider' && (
              <View style={{ flex: 1 }}>
                <FlatList
                  data={services}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item: service }) => {
                    const isAdded = selectedServices.some(s => s.servic_type_id === service.id);
                    return (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1
                      }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#2c3e50',
                            marginBottom: 4
                          }}>
                            {service.name}
                          </Text>
                          <TextInput
                            placeholder="Enter price"
                            value={servicePrices[service.id] || ''}
                            onChangeText={(text) => setServicePrices(prev => ({ ...prev, [service.id]: text }))}
                            keyboardType="numeric"
                            style={{
                              height: 36,
                              backgroundColor: '#f7f9fc',
                              borderRadius: 8,
                              paddingHorizontal: 8,
                              fontSize: 14
                            }}
                          />
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            if (isAdded) {
                              setSelectedServices(selectedServices.filter((s) => s.servic_type_id !== service.id));
                            } else {
                              const numericPrice = parseFloat(servicePrices[service.id]) || 0;
                              setSelectedServices([...selectedServices, { servic_type_id: service.id, price: numericPrice }]);
                            }
                          }}
                          style={{
                            marginLeft: 12,
                            backgroundColor: isAdded ? '#fee2e2' : '#dcfce7',
                            padding: 8,
                            borderRadius: 8,
                            minWidth: 80,
                            alignItems: 'center'
                          }}
                        >
                          <Text style={{
                            color: isAdded ? '#dc2626' : '#16a34a',
                            fontSize: 14,
                            fontWeight: '500'
                          }}>
                            {isAdded ? <MaterialIcons name="remove" size={24} color={isAdded ? '#dc2626' : '#16a34a'} /> : <MaterialIcons name="add" size={24} color={isAdded ? '#dc2626' : '#16a34a'} />}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
              </View>
            )}

          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Create Account</Text>

      <ProgressBar progress={step / totalSteps} style={styles.progress} />

      {renderStep()}

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
            style={styles.button}
          >
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
          >
            Register
          </Button>
        )}
      </View>

      <Link href="/login" asChild>
        <Button mode="text">Already have an account? Login</Button>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  progress: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
}); 