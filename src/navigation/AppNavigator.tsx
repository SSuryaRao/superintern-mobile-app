// src/navigation/AppNavigator.tsx

import React, { useEffect } from 'react';
import { SvgXml } from 'react-native-svg';
import SplashScreen from 'react-native-splash-screen';
import { pingServer } from '../api/api';

// --- NAVIGATOR IMPORTS ---
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// --- SCREEN IMPORTS ---
import DashboardScreen from '../screens/DashboardScreen';
import MyTasksScreen from '../screens/MyTasksScreen';
import JobsScreen from '../screens/JobsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';

// --- ICONS ---
const homeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
const myTasksIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 9 9 15"></polyline><polyline points="15 9 15 15"></polyline><line x1="9" y1="12" x2="15" y2="12"></line></svg>`;
const jobsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h8"></path><path d="M8 10h8"></path><path d="M8 14h4"></path></svg>`;
const chatIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DashboardStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // --- THIS LINE IS NOW CORRECTED FOR TYPESCRIPT ---
        const minimumDelay = new Promise(resolve => setTimeout(() => resolve(null), 3000));
        const serverWarmUp = pingServer();

        await Promise.all([serverWarmUp, minimumDelay]);
        console.log('Server is warm and minimum splash time has passed.');

      } catch (error) {
        console.warn('Could not warm up server, but continuing after minimum delay:', error);
      } finally {
        SplashScreen.hide();
      }
    };

    initializeApp();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ size, focused }) => {
          let iconXml: string = '';
          const iconColor = focused ? '#6366F1' : '#6B7280';
          if (route.name === 'Dashboard') iconXml = homeIcon;
          else if (route.name === 'MyTasks') iconXml = myTasksIcon;
          else if (route.name === 'Jobs') iconXml = jobsIcon;
          else if (route.name === 'Chat') iconXml = chatIcon;
          return <SvgXml xml={iconXml || ''} width={size} height={size} stroke={iconColor} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          shadowRadius: 20,
          height: 60,
          paddingBottom: 5
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
      <Tab.Screen name="MyTasks" component={MyTasksScreen} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Chat" component={ChatbotScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;