import { Tabs } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

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
          title: 'Home',
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
          title: 'Active',
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
          title: 'History',
          headerShown: false,
          href: userRole === 'user' ? '/history' : null,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* Provider Tabs */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
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
          title: 'Requests',
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
          title: 'Earnings',
          headerShown: false,
          href: userRole === 'provider' ? '/earnings' : null,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="wallet" size={size} color={color} />
          ),
        }}
      />

      {/* Common Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          href: userRole === 'user' ? '/profile' : null,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="request-service"
        options={{
          title: 'Request Service',
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