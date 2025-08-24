import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native'; // Import the hook

const AppHeader = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation(); // Get the navigation object

  const handleLogout = () => {
    signOut(auth).then(() => console.log('User signed out!'));
  };

  const handleProfilePress = () => {
    // Navigate to the Profile screen
    navigation.navigate('Profile' as never);
  };

  const getInitials = () => {
    if (user && user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  return (
    <View style={styles.headerContainer}>
      {/* Wrap user info in a TouchableOpacity */}
      <TouchableOpacity style={styles.userInfo} onPress={handleProfilePress}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <View>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userRole}>User</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles remain the same...
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
  userEmail: {
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