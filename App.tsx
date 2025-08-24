import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

import AppNavigator from './src/navigation/AppNavigator'; // Your main Tab Navigator
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen'; // Import the new screen

const Stack = createStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    // Unsubscribe on unmount
    return subscriber;
  }, [initializing]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // If the user is logged in, show the main app stack
          <>
            <Stack.Screen name="MainApp" component={AppNavigator} />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ presentation: 'modal' }} // This makes it slide up
            />
          </>
        ) : (
          // Otherwise, show the login screen
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;