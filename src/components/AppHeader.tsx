import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { getMyProfile } from '../api/api'; // Import the profile fetching function

const AppHeader = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();
  
  // State to hold the user's full name
  const [userName, setUserName] = useState(user?.displayName || user?.email || 'User');

  useEffect(() => {
    // Function to fetch the user profile from your backend
    const fetchUserName = async () => {
      try {
        const response = await getMyProfile();
        if (response.data && response.data.fullName) {
          setUserName(response.data.fullName);
        }
      } catch (error) {
        console.error("Failed to fetch user's full name:", error);
        // Fallback to email if profile fetch fails
        setUserName(user?.email || 'User');
      }
    };

    fetchUserName();
  }, [user?.email]);

  const handleLogout = () => {
    signOut(auth).then(() => console.log('User signed out!'));
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  // Generates initials from the user's name
  const getInitials = () => {
    if (userName) {
      const nameParts = userName.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return userName.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.userInfo} onPress={handleProfilePress}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <View>
          {/* Display the fetched user name */}
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRole}>User</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  userRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '500',
  },
});

export default AppHeader;