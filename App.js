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
import MapScreen from './screens/Map'; // ✅ use your real Map screen

const AlertsScreen = () => null;
const SettingsScreen = () => null;
const CallScreen = () => null;
const StatusScreen = () => null;

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
          overflow: 'visible',      // let long labels spill horizontally
        },
        tabBarItemStyle: {
          overflow: 'visible',      // allow each item to let children overflow
        },
        tabBarLabel: () => null,
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Dashboard: 'speedometer-outline',
            Map: 'map-outline',
            Alerts: 'notifications-outline',
            Settings: 'settings-outline',
            Call: 'call-outline',
            Status: 'information-circle-outline',
          };

          return (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: 30,          // keeps icon anchoring stable
                width: '100%',
              }}
            >
              <Ionicons name={icons[route.name]} size={30} color={color} />

              {/* Label: always rendered (no layout shift), single line, wide width so it can overflow horizontally */}
              <Text
                style={{
                  position: 'absolute',
                  top: 40,
                                 // sits under icon
                  color,
                  fontSize: 10,
                  fontWeight: '600',
                  opacity: focused ? 1 : 0, // invisible when inactive, but space reserved
                  width: 160,              // wide so long names spill into neighbors
                  textAlign: 'center',
                  marginLeft: 2,
                  includeFontPadding: false, // Android: tighter vertical box
                  zIndex: 1,
                }}
                numberOfLines={1}
                ellipsizeMode="clip"        // no ellipsis; allow visual overflow horizontally
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
      <Tab.Screen name="Call" component={CallScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#EEF2F6' },
  };

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
