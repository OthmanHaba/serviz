import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Link, useRouter } from 'expo-router';
import { login } from '@/lib/api/login';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { control, handleSubmit } = useForm<LoginForm>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const [error , setError]= useState<{
    message:string,
  } | null>(null);


  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const response = await login(data);
      if(response.status === 200) {
        if(response.data.user.role === 'provider') {
          setUser(response.data.user);
          setToken(response.data.token);
          router.push('/(app)/dashboard');
        } else {
          setUser(response.data.user);
          setToken(response.data.token);
          router.push('/(app)/home');
        }
      } else {
        console.log(response.data.message)
        Alert.alert('Error', response.data.message);
      }
    } catch (_error) {
      if(_error.status == 401){
        setError({
          "message" : "Invalid credentials"
        });
      }
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
      
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

      {error && (
        <View>
          <Text style={{color: 'red'}}>{error.message}</Text>
        </View>

      )}

      <Button
        mode="contained"
        // disabled={value}
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
      >
        Login
      </Button>

      <Link href="/register" asChild>
        <Button mode="text">Don't have an account? Register</Button>
      </Link>

      {/* <Link href="/forgot-password" asChild>
        <Button mode="text">Forgot Password?</Button>
      </Link> */}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6750A4" />
            <Text style={styles.loadingText}>Logging in...</Text>
          </View>
        </View>
      )}
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
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
  },
}); 