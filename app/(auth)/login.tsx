import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Link, useRouter } from 'expo-router';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const router = useRouter();
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { control, handleSubmit } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      // TODO: Implement login API call
      console.log(data);
      router.push('/(app)/home');
    } catch (error) {
      console.error(error);
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

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
      >
        Login
      </Button>

      <Link href="/register" asChild>
        <Button mode="text">Don't have an account? Register</Button>
      </Link>

      <Link href="/forgot-password" asChild>
        <Button mode="text">Forgot Password?</Button>
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
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
}); 