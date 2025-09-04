import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView, View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, StatusBar, KeyboardAvoidingView,
    ScrollView, Platform, Animated
} from 'react-native';
import {
    getAuth,
    signInWithCredential,
    GoogleAuthProvider
} from '@react-native-firebase/auth';
import {
    GoogleSignin,
    statusCodes
} from '@react-native-google-signin/google-signin';
import { SvgXml } from 'react-native-svg';
import { loginOrRegister } from '../api/api'; // Import the API function

// Configure Google Sign-In
GoogleSignin.configure({
    webClientId: '859071293830-r9dbsokmi0knv79ldcnfesfp05fvu69b.apps.googleusercontent.com', // From Firebase Console
});

// --- SVG Icons ---
const googleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;

const LoginScreen = () => {
    const [loading, setLoading] = useState(false);
    const [referralCode, setReferralCode] = useState(''); // For referral tracking

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Staggered animation effect on component mount
        Animated.stagger(200, [
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    // Call backend API after successful authentication
    const handleBackendLogin = async (code?: string) => {
        try {
            const response = await loginOrRegister(code);
            console.log('Backend login successful:', response.data);
            // You can store user data in context or Redux here if needed
        } catch (error) {
            console.error('Backend login error:', error);
            // Don't show error to user as Firebase auth succeeded
            // Backend will create user on first login
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);

            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Sign in with Google
            await GoogleSignin.signIn();

            // Get the tokens - this returns an object with idToken and accessToken
            const tokens = await GoogleSignin.getTokens();

            if (!tokens.idToken) {
                throw new Error('No ID token received from Google Sign-In');
            }

            // Create a Google credential with the token
            const googleCredential = GoogleAuthProvider.credential(tokens.idToken);

            // Sign-in the user with the credential
            const auth = getAuth();
            const userCredential = await signInWithCredential(auth, googleCredential);

            console.log('Signed in with Google!', userCredential.user.email);

            // Call backend API after successful Google sign-in
            await handleBackendLogin(referralCode);

        } catch (error: any) {
            console.error('Google Sign-In Error:', error);

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // User cancelled the sign-in flow
                console.log('User cancelled Google Sign-In');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // Sign-in is already in progress
                console.log('Google Sign-In already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Google Play Services is not available or outdated.');
            } else {
                Alert.alert('Google Sign-In Failed', error.message || 'Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <Text style={styles.title}>SuperIntern</Text>
                        <Text style={styles.subtitle}>Welcome! Sign in to continue your journey</Text>
                    </Animated.View>

                    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Referral Code (Optional)</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter referral code"
                                    placeholderTextColor="#9CA3AF"
                                    value={referralCode}
                                    onChangeText={setReferralCode}
                                    autoCapitalize="characters"
                                    editable={!loading}
                                />
                            </View>
                        </View>
                        
                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGoogleSignIn}
                            disabled={loading}
                        >
                            <SvgXml xml={googleIcon} />
                            <Text style={styles.googleButtonText}>
                                {loading ? 'Signing in...' : 'Continue with Google'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F5FF' },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    title: { fontSize: 40, fontWeight: 'bold', color: '#4338CA', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 40 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '500' },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        fontSize: 16,
        color: '#111827',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    googleButtonText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
});

export default LoginScreen;