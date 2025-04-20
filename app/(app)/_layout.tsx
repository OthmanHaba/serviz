import { Tabs } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { I18nManager } from 'react-native';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function AppLayout() {
  const theme = useTheme();

  const [userRole, setUserRole] = useState<'user' | 'provider'>('user');

  useEffect(() => {
    const { user } = useAuthStore.getState();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.onBackground,
        headerShadowVisible: false,
      }}
    >
      {/* User Tabs */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'الرئيسية',
          headerShown: false,
          href: userRole === 'user' ? '/home' : null,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="active-requests"
        options={{
          title: 'النشط',
          headerShown: false,
          href: null,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="clockcircleo" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'التاريخ',
          headerShown: false,
          // href: userRole === 'user' ? '/history' : null,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* Provider Tabs */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'لوحة التحكم',
          headerShown: false,
          href: userRole === 'provider' ? '/dashboard' : null,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'الطلبات',
          headerShown: false,
          href: userRole === 'provider' ? '/requests' : null,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="profile" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'الأرباح',
          headerShown: false,
          // href: userRole === 'provider' ? '/earnings' : null,
          href: null,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="wallet" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="support/[id]"
        options={{
          title: 'الأرباح',
          headerShown: false,
          // href: userRole === 'provider' ? '/earnings' : null,
          href: null,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="wallet" size={size} color={color} />
          ),
        }}
      />

      {/* Common Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'الملف الشخصي',
          headerShown: false,
          // href: userRole === 'user' ? '/profile' : null,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="support-sessions"
        options={{
          title: 'الدعم',
          headerShown: false,
          // href: userRole === 'user' ? '/profile' : null,
          tabBarIcon: ({ color, size }) => (
            // <AntDesign name="subject" size={size} color={color} />
            <MaterialIcons name="contact-support" size={24} color="black" />
          ),
        }}
      />

      <Tabs.Screen
        name="request-service"
        options={{
          title: 'طلب خدمة',
          href: null,
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 