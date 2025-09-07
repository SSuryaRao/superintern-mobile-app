import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    StatusBar,
    Image,
    TextInputProps,
    ActivityIndicator,
    ActionSheetIOS,
    Platform
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { SvgXml } from 'react-native-svg';
import { launchImageLibrary, launchCamera, ImageLibraryOptions, Asset, CameraOptions } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import axios from 'axios';

// --- API CONFIGURATION (Integrated from your api.ts file) ---

// Base URL for your API
const API_BASE_URL = 'https://superintern-local.onrender.com/api';

// Create an Axios instance for API requests
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30-second timeout
});

// Add a request interceptor to automatically include the Firebase auth token in headers
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth().currentUser;
      // If a user is logged in, get their ID token
      if (user) {
        const token = await user.getIdToken();
        // Set the Authorization header for the request
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('API Interceptor: Error getting auth token:', error);
      // Let the request proceed without the token if an error occurs
      return config;
    }
  },
  (error) => {
    // Handle request configuration errors
    return Promise.reject(error);
  }
);


// --- API FUNCTIONS (Integrated and now used by the component) ---

/**
 * Fetches the current user's profile data from the server.
 */
export const getMyProfile = () => {
  return api.get('/users/me');
};

/**
 * Updates the current user's profile data on the server.
 * @param profileData - The profile data to update.
 */
export const updateMyProfile = (profileData: Partial<ProfileData>) => {
  return api.put('/users/me', profileData);
};

/**
 * Uploads a user's introductory video.
 * @param formData - The FormData object containing the video file.
 */
export const uploadIntroVideo = (formData: FormData) => {
  // Axios automatically sets the correct 'Content-Type' header for FormData
  return api.post('/users/upload-video', formData);
};


// --- SVG ICONS (No changes) ---
const userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
const phoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81 .7A2 2 0 0 1 22 16.92z"></path></svg>`;
const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
const locationIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
const skillsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
const uploadIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;
const documentIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`;

// --- TYPES AND INTERFACES (No changes) ---
type IconTextInputProps = TextInputProps & {
    icon: string;
};

type ProfileData = {
    name?: string;
    phone?: string;
    github?: string;
    location?: string;
    skills?: string[];
    aboutMe?: string;
    videoUrl?: string;
};

type ProfileScreenProps = {
    navigation: any;
};

// --- HELPER COMPONENTS (No changes) ---
const IconTextInput = ({ icon, ...props }: IconTextInputProps) => (
    <View style={styles.inputContainer}>
        <SvgXml xml={icon} />
        <TextInput style={styles.input} placeholderTextColor="#9CA3AF" {...props} />
    </View>
);

// --- MAIN PROFILE SCREEN COMPONENT ---
const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
    const user = auth().currentUser;

    // State variables
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [github, setGithub] = useState('');
    const [location, setLocation] = useState('');
    const [skills, setSkills] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [cvUrl, setCvUrl] = useState<string | null>(null);
    const [isUploadingCv, setIsUploadingCv] = useState(false);

    // Fetch profile data when the component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // **INTEGRATION**: Using the real API function to fetch data
                const response = await getMyProfile();
                const profile = response.data;
                if (profile) {
                    setFullName(profile.name || '');
                    setPhone(profile.phone || '');
                    setGithub(profile.github || '');
                    setLocation(profile.location || '');
                    setSkills(profile.skills?.join(', ') || '');
                    setAboutMe(profile.aboutMe || '');
                    setVideoUrl(profile.videoUrl || null);
                }
            } catch (error: any) {
                // **INTEGRATION**: Improved error logging
                console.error("Failed to fetch profile:", error.response?.data || error.message);
                Alert.alert("Error", "Could not load your profile data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const requestPermission = async (permission: any) => {
        try {
            const result = await request(permission);
            return result === RESULTS.GRANTED;
        } catch (error) {
            console.error("Permission request failed: ", error);
            return false;
        }
    };

    const handleChooseAvatar = () => {
        const options: ImageLibraryOptions = { mediaType: 'photo', quality: 1 };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('Error', `Could not select photo. ${response.errorMessage || 'Please try again.'}`);
                return;
            }
            if (response.assets && response.assets[0]) {
                setAvatarUri(response.assets[0].uri || null);
            }
        });
    };

    const processVideo = async (asset: Asset) => {
        if (!asset.uri) {
            Alert.alert("Error", "Selected video file is invalid.");
            return;
        }
        setIsUploadingVideo(true);

        try {
            let videoUri = asset.uri;
            if (Platform.OS === 'android' && videoUri.startsWith('content://')) {
                const destPath = `${RNFS.TemporaryDirectoryPath}/${asset.fileName || `temp_video_${Date.now()}.mp4`}`;
                await RNFS.copyFile(videoUri, destPath);
                videoUri = `file://${destPath}`;
            }

            const formData = new FormData();
            formData.append('video', {
                uri: Platform.OS === 'ios' ? videoUri.replace('file://', '') : videoUri,
                type: asset.type || 'video/mp4',
                name: asset.fileName || `video_${Date.now()}.mp4`,
            } as any);
            
            // **INTEGRATION**: Using the real API function to upload the video
            const response = await uploadIntroVideo(formData);
            Alert.alert("Success", "Your profile video has been uploaded!");
            
            if (response.data && response.data.videoUrl) {
                setVideoUrl(response.data.videoUrl);
            }
        } catch (error: any) {
            // **INTEGRATION**: Improved error logging
            console.error("Video upload failed:", error.response?.data || error.message);
            Alert.alert("Upload Failed", "Could not upload your video. Please try again.");
        } finally {
            setIsUploadingVideo(false);
        }
    };

    const handleRecordVideo = async () => {
        const cameraPermission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
        const hasPermission = await requestPermission(cameraPermission);
        if (!hasPermission) {
            Alert.alert("Permission Denied", "Camera access is required to record a video.");
            return;
        }

        const options: CameraOptions = { mediaType: 'video', videoQuality: 'high', durationLimit: 60, cameraType: 'front' };
        launchCamera(options, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('Error', `Could not record video. ${response.errorMessage || 'Please try again.'}`);
                return;
            }
            if (response.assets && response.assets[0]) {
                processVideo(response.assets[0]);
            }
        });
    };
 
    const handleSelectVideoFromGallery = async () => {
        const galleryPermission = Platform.select({
            ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
            android: parseInt(Platform.Version as string, 10) >= 33
                ? PERMISSIONS.ANDROID.READ_MEDIA_VIDEO
                : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        });
    
        if (!galleryPermission) {
            Alert.alert("Error", "Unsupported platform.");
            return;
        }
    
        const hasPermission = await requestPermission(galleryPermission);
        if (!hasPermission) {
            Alert.alert("Permission Denied", "Storage access is required to select a video.");
            return;
        }
        
        const options: ImageLibraryOptions = { mediaType: 'video', videoQuality: 'high' };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('Error', `Could not select video. ${response.errorMessage || 'Please try again.'}`);
                return;
            }
            if (response.assets && response.assets[0]) {
                processVideo(response.assets[0]);
            }
        });
    };

    const showVideoOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ['Cancel', 'Record Video', 'Choose from Gallery'], cancelButtonIndex: 0 },
                (buttonIndex) => {
                    if (buttonIndex === 1) handleRecordVideo();
                    else if (buttonIndex === 2) handleSelectVideoFromGallery();
                }
            );
        } else {
            Alert.alert(
                'Upload Profile Video', 'Choose an option',
                [
                    { text: 'Record Video', onPress: handleRecordVideo },
                    { text: 'Choose from Gallery', onPress: handleSelectVideoFromGallery },
                    { text: 'Cancel', style: 'cancel' },
                ],
                { cancelable: true }
            );
        }
    };

    const handleUploadCv = async () => {
        setIsUploadingCv(true);
        // TODO: Implement CV upload functionality when backend API is ready
        // For now, just simulate a successful upload
        setTimeout(() => {
            setCvUrl('cv_placeholder_url'); // Placeholder URL
            setIsUploadingCv(false);
            Alert.alert("Success", "CV upload functionality will be connected to backend API soon!");
        }, 2000);
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const profileData: Partial<ProfileData> = {
                name: fullName,
                phone,
                github,
                location,
                aboutMe,
                skills: skills.split(',').map(s => s.trim()).filter(Boolean),
            };
            // **INTEGRATION**: Using the real API function to update the profile
            await updateMyProfile(profileData);
            Alert.alert("Profile Saved", "Your information has been updated!");
            
            // **CHANGE**: As requested, navigation.goBack() is removed to stay on the screen.
            // navigation.goBack(); 

        } catch (error: any) {
            // **INTEGRATION**: Improved error logging
            console.error("Failed to save profile:", error.response?.data || error.message);
            Alert.alert("Error", "Could not save your profile. Please check your inputs and try again.");
        } finally {
            setSaving(false);
        }
    };

    const getInitials = () => {
        if (fullName) return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        return user?.email?.substring(0, 2).toUpperCase() || '??';
    };

    // Render loading indicator while fetching data
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366F1" />
            </SafeAreaView>
        );
    }
    
    // Main component render
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Profile</Text>
                    <TouchableOpacity onPress={handleSaveChanges} disabled={saving}>
                        <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.profileHeader}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={handleChooseAvatar}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatar} />
                        ) : (
                           <View style={styles.avatar}>
                               <Text style={styles.avatarText}>{getInitials()}</Text>
                           </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{fullName || 'Your Name'}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Media</Text>
                    <TouchableOpacity 
                        style={styles.uploadButton} 
                        onPress={showVideoOptions} 
                        disabled={isUploadingVideo}
                    >
                        {isUploadingVideo ? (
                            <ActivityIndicator color="#6366F1" />
                        ) : (
                            <>
                                <SvgXml xml={uploadIcon} stroke="#6366F1" />
                                <Text style={styles.uploadButtonText}>Upload a Profile Video</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    {videoUrl && !isUploadingVideo && (
                        <View style={styles.videoPreview}>
                            <Text style={styles.videoPreviewText}>✓ Video uploaded successfully</Text>
                            <TouchableOpacity onPress={showVideoOptions}>
                                <Text style={styles.replaceVideoText}>Replace Video</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* CV Upload Section */}
                    <TouchableOpacity 
                        style={styles.uploadButton} 
                        onPress={handleUploadCv} 
                        disabled={isUploadingCv}
                    >
                        {isUploadingCv ? (
                            <ActivityIndicator color="#6366F1" />
                        ) : (
                            <>
                                <SvgXml xml={documentIcon} stroke="#6366F1" />
                                <Text style={styles.uploadButtonText}>Upload CV/Resume</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    {cvUrl && !isUploadingCv && (
                        <View style={styles.videoPreview}>
                            <Text style={styles.videoPreviewText}>✓ CV uploaded successfully</Text>
                            <TouchableOpacity onPress={handleUploadCv}>
                                <Text style={styles.replaceVideoText}>Replace CV</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Personal & Professional</Text>
                    <IconTextInput icon={userIcon} value={fullName} onChangeText={setFullName} placeholder="Full Name" />
                    <IconTextInput icon={phoneIcon} value={phone} onChangeText={setPhone} placeholder="Phone Number" keyboardType="phone-pad" />
                    <IconTextInput icon={locationIcon} value={location} onChangeText={setLocation} placeholder="Location (e.g., San Francisco, CA)" />
                    <IconTextInput icon={githubIcon} value={github} onChangeText={setGithub} placeholder="GitHub Profile URL" autoCapitalize="none" />
                    <IconTextInput icon={skillsIcon} value={skills} onChangeText={setSkills} placeholder="Skills (comma-separated)" />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>About Me</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={aboutMe} onChangeText={setAboutMe} placeholder="Tell us about yourself..." multiline placeholderTextColor="#9CA3AF" />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSaveChanges} disabled={saving}>
                    {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Save Changes</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

// --- STYLES (No changes) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
    doneText: { fontSize: 16, color: '#6366F1', fontWeight: '600' },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#E0E7FF'
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
    },
    profileEmail: {
        fontSize: 16,
        color: '#6B7280',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 12,
    },
    button: {
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E7FF',
        borderStyle: 'dashed',
        backgroundColor: '#F9FAFB'
    },
    uploadButtonText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#6366F1',
        fontWeight: '600'
    },
    videoPreview: {
        marginTop: 16,
        alignItems: 'center',
    },
    videoPreviewText: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '500',
        marginBottom: 8,
    },
    replaceVideoText: {
        fontSize: 14,
        color: '#6366F1',
        fontWeight: '600',
        textDecorationLine: 'underline',
    }
});

export default ProfileScreen;