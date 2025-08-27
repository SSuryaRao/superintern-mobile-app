// src/navigation/AppNavigator.tsx

import React, { useEffect } from 'react'; // Make sure useEffect is imported
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SvgXml } from 'react-native-svg';
import SplashScreen from 'react-native-splash-screen'; // Import the splash screen library

import DashboardScreen from '../screens/DashboardScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import JobsScreen from '../screens/JobsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';

const homeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
const leaderboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 15h1.5a2.5 2.5 0 0 1 0 5H4"></path><path d="M19.5 15H18a2.5 2.5 0 0 0 0 5h1.5"></path><path d="M12 6V3"></path><path d="M12 21v-3"></path><path d="M9 12H3"></path><path d="M21 12h-6"></path><circle cx="12" cy="12" r="4"></circle></svg>`;
const jobsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h8"></path><path d="M8 10h8"></path><path d="M8 14h4"></path></svg>`;
const chatIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  // Add this hook to hide the splash screen when the navigator mounts
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ size, focused }) => {
          let iconXml: string = '';
          const iconColor = focused ? '#6366F1' : '#6B7280';
          if (route.name === 'Dashboard') iconXml = homeIcon;
          else if (route.name === 'Leaderboard') iconXml = leaderboardIcon;
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Chat" component={ChatbotScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;