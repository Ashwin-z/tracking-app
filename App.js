// App.js
import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/Login';
import DashboardScreen from './screens/DashboardScreen';
import MapScreen from './screens/Map';
import StatusScreen from './screens/Status';
import SettingsScreen from './screens/Setting';
import AlertsScreen from './screens/Alerts';
import ContactScreen from './screens/Contact';

import { AuthProvider } from './context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#D18846',
        tabBarStyle: {
          height: 72 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 10,
          overflow: 'visible',
        },
        tabBarItemStyle: { overflow: 'visible' },
        tabBarLabel: () => null,
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Dashboard: 'speedometer-outline',
            Status: 'information-circle-outline',
            Map: 'map-outline',
            Alerts: 'notifications-outline',
            Settings: 'settings-outline',
            Contact: 'call-outline',
          };
          return (
            <View style={{ alignItems: 'center', justifyContent: 'flex-start', height: 30, width: '100%' }}>
              <Ionicons name={icons[route.name]} size={30} color={color} />
              <Text
                style={{
                  position: 'absolute',
                  top: 40,
                  color,
                  fontSize: 10,
                  fontWeight: '600',
                  opacity: focused ? 1 : 0,
                  width: 160,
                  textAlign: 'center',
                  includeFontPadding: false,
                  zIndex: 1,
                }}
                numberOfLines={1}
                ellipsizeMode="clip"
                pointerEvents="none"
              >
                {route.name}
              </Text>
            </View>
          );
        },
      })}
      sceneContainerStyle={{ backgroundColor: '#EEF2F6' }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Status" component={StatusScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Contact" component={ContactScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#EEF2F6' },
  };

  return (
    <AuthProvider>
      <NavigationContainer theme={theme}>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
