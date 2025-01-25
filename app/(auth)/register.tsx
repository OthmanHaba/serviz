import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, ProgressBar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';

const registrationSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  vehicleType: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const { control, handleSubmit, watch } = useForm<RegistrationForm>();

  const onSubmit = async (data: RegistrationForm) => {
    try {
      // TODO: Implement registration API call
      console.log(data);
      router.replace('/');
    } catch (error) {
      console.error(error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
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
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
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
    </View>
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