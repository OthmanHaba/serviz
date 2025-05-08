import React, {
  ScrollView,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  ProgressBar,
  RadioButton,
  Checkbox,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import useServiceStore from "@/stores/serviceStore";
import { RegisterService } from "@/lib/services/register";
import { MaterialIcons } from "@expo/vector-icons";

// Arabic translations
const translations = {
  title: "إنشاء حساب",
  steps: {
    back: "رجوع",
    next: "التالي",
    register: "تسجيل",
  },
  fields: {
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    password: "كلمة المرور",
    vehicleType: "نوع المركبة",
    vehicleModel: "موديل المركبة",
    vehicleYear: "سنة المركبة",
    role: {
      user: "مستخدم",
      provider: "مزود خدمة",
    },
  },
  service: {
    enterPrice: "أدخل السعر",
    add: "إضافة",
    remove: "إزالة",
  },
  login: "لديك حساب بالفعل؟ تسجيل الدخول",
};

type Service = {
  id: number;
  name: string;
  image: string;
  description: string;
};

const registrationSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  name: z.string().optional(),
  password: z.string().min(6),
  vehicleType: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  role: z.enum(["user", "provider"]),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<RegistrationForm>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      vehicleType: "",
      vehicleModel: "",
      vehicleYear: "",
      role: "user",
    },
  });
  const { role: initialRole } = useLocalSearchParams();
  const { services, fetchServices } = useServiceStore();
  const [selectedServices, setSelectedServices] = useState<
    {
      servic_type_id: number;
      price: number;
    }[]
  >([]);
  const [servicePrices, setServicePrices] = useState<{ [key: number]: string }>(
    {}
  );

  // Watch the role value from the form
  const formRole = watch("role");

  // Reset form when component mounts
  useEffect(() => {
    reset({
      name: "",
      email: "",
      phone: "",
      password: "",
      vehicleType: "",
      vehicleModel: "",
      vehicleYear: "",
      role: (initialRole as "user" | "provider") || "user",
    });
  }, []);

  useEffect(() => {
    if (initialRole) {
      setValue("role", initialRole as "user" | "provider");
    }
  }, [initialRole]);

  useEffect(() => {
    if (formRole) {
      router.setParams({ role: formRole });
    }
  }, [formRole]);

  const onSubmit = async (data: RegistrationForm) => {
    try {
      const registerService = new RegisterService();
      registerService.setUserInfo({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });
      registerService.setServices(selectedServices);
      registerService.setVichaleInfo({
        vehicleType: data.vehicleType,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
      });

      const response = await registerService.register();
      router.replace("/login");
    } catch (error: any) {
      console.error(error.response.data);
    }
  };

  const renderFormFields = () => {
    return (
      <>
        <Controller
          control={control}
          name="role"
          rules={{ required: "نوع الحساب مطلوب" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <RadioButton.Group
              onValueChange={(newValue) => {
                onChange(newValue);
                if (newValue === "user") {
                  setSelectedServices([]);
                  setServicePrices({});
                }
              }}
              value={value || "user"}
            >
              <RadioButton.Item
                label={translations.fields.role.user}
                value="user"
              />
              <RadioButton.Item
                label={translations.fields.role.provider}
                value="provider"
              />
            </RadioButton.Group>
          )}
        />
        {errors.role && (
          <Text style={styles.errorText}>{errors.role.message}</Text>
        )}

        <Controller
          control={control}
          name="name"
          rules={{ required: "الاسم مطلوب" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInput
              label={translations.fields.name}
              value={value || ""}
              onChangeText={onChange}
              error={!!error}
              style={styles.input}
              textAlign="right"
            />
          )}
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name.message}</Text>
        )}

        <Controller
          control={control}
          name="email"
          rules={{
            required: "البريد الإلكتروني مطلوب",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "البريد الإلكتروني غير صالح",
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInput
              label={translations.fields.email}
              value={value || ""}
              onChangeText={onChange}
              error={!!error}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="right"
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}

        <Controller
          control={control}
          name="phone"
          rules={{
            required: "رقم الهاتف مطلوب",
            minLength: {
              value: 10,
              message: "رقم الهاتف يجب أن يكون 10 أرقام على الأقل",
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInput
              label={translations.fields.phone}
              value={value || ""}
              onChangeText={onChange}
              error={!!error}
              style={styles.input}
              keyboardType="phone-pad"
              textAlign="right"
            />
          )}
        />
        {errors.phone && (
          <Text style={styles.errorText}>{errors.phone.message}</Text>
        )}

        <Controller
          control={control}
          name="password"
          rules={{
            required: "كلمة المرور مطلوبة",
            minLength: {
              value: 6,
              message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInput
              label={translations.fields.password}
              value={value || ""}
              onChangeText={onChange}
              error={!!error}
              secureTextEntry
              style={styles.input}
              textAlign="right"
            />
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}

        <Controller
          control={control}
          name="vehicleType"
          rules={{ required: "نوع المركبة مطلوب" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInput
              label={translations.fields.vehicleType}
              value={value || ""}
              onChangeText={onChange}
              error={!!error}
              style={styles.input}
              textAlign="right"
            />
          )}
        />
        {errors.vehicleType && (
          <Text style={styles.errorText}>{errors.vehicleType.message}</Text>
        )}

        <Controller
          control={control}
          name="vehicleModel"
          rules={{ required: "موديل المركبة مطلوب" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInput
              label={translations.fields.vehicleModel}
              value={value || ""}
              onChangeText={onChange}
              error={!!error}
              style={styles.input}
              textAlign="right"
            />
          )}
        />
        {errors.vehicleModel && (
          <Text style={styles.errorText}>{errors.vehicleModel.message}</Text>
        )}

        <Controller
          control={control}
          name="vehicleYear"
          rules={{
            required: "سنة المركبة مطلوبة",
            pattern: {
              value: /^\d{4}$/,
              message: "سنة المركبة يجب أن تكون 4 أرقام",
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInput
              label={translations.fields.vehicleYear}
              value={value || ""}
              onChangeText={onChange}
              error={!!error}
              style={styles.input}
              keyboardType="numeric"
              textAlign="right"
            />
          )}
        />
        {errors.vehicleYear && (
          <Text style={styles.errorText}>{errors.vehicleYear.message}</Text>
        )}

        {formRole === "provider" && (
          <View style={{ flex: 1 }}>
            {selectedServices.length === 0 && (
              <Text style={styles.errorText}>
                يجب إضافة خدمة واحدة على الأقل
              </Text>
            )}
            {services.map((service) => {
              const isAdded = selectedServices.some(
                (s) => s.servic_type_id === service.id
              );
              return (
                <View
                  key={service.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#2c3e50",
                        marginBottom: 4,
                        textAlign: "right",
                      }}
                    >
                      {service.name}
                    </Text>
                    <TextInput
                      placeholder={translations.service.enterPrice}
                      value={servicePrices[service.id] || ""}
                      onChangeText={(text) =>
                        setServicePrices((prev) => ({
                          ...prev,
                          [service.id]: text,
                        }))
                      }
                      keyboardType="numeric"
                      style={{
                        height: 36,
                        backgroundColor: "#f7f9fc",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        fontSize: 14,
                        textAlign: "right",
                      }}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (isAdded) {
                        setSelectedServices(
                          selectedServices.filter(
                            (s) => s.servic_type_id !== service.id
                          )
                        );
                      } else {
                        const numericPrice =
                          parseFloat(servicePrices[service.id]) || 0;
                        setSelectedServices([
                          ...selectedServices,
                          { servic_type_id: service.id, price: numericPrice },
                        ]);
                      }
                    }}
                    style={{
                      marginLeft: 12,
                      backgroundColor: isAdded ? "#fee2e2" : "#dcfce7",
                      padding: 8,
                      borderRadius: 8,
                      minWidth: 80,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: isAdded ? "#dc2626" : "#16a34a",
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      {isAdded
                        ? translations.service.remove
                        : translations.service.add}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={[styles.button, { marginTop: 20 }]}
        >
          {translations.steps.register}
        </Button>

        <Link href="/login" asChild>
          <Button mode="text">{translations.login}</Button>
        </Link>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { direction: "rtl" }]}>
      <Text variant="headlineMedium" style={styles.title}>
        {translations.title}
      </Text>
      <FlatList
        data={[1]} // Single item to render the form
        renderItem={() => renderFormFields()}
        keyExtractor={() => "form"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    paddingBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginVertical: 10,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginBottom: 8,
    textAlign: "right",
  },
});
