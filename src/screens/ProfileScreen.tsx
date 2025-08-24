import React, { useState } from 'react';
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
    TextInputProps
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { SvgXml } from 'react-native-svg';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';

// --- SVG Icons ---
const userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
const phoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
const universityIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v11h18V10M3 10V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M12 2v20"></path><path d="M6 12h12"></path></svg>`;
const locationIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
const majorIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
const calendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
const skillsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
const uploadIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;
const cameraIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;

type IconTextInputProps = TextInputProps & {
    icon: string;
};

const IconTextInput = ({ icon, ...props }: IconTextInputProps) => (
    <View style={styles.inputContainer}>
        <SvgXml xml={icon} />
        <TextInput style={styles.input} placeholderTextColor="#9CA3AF" {...props} />
    </View>
);

type ProfileScreenProps = {
    navigation: any;
};

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
    const user = auth().currentUser;

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [github, setGithub] = useState('');
    const [university, setUniversity] = useState('');
    const [location, setLocation] = useState('');
    const [major, setMajor] = useState('');
    const [gradYear, setGradYear] = useState('');
    const [skills, setSkills] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [videoUri, setVideoUri] = useState<string | null>(null);

    const handleChooseAvatar = () => {
        const options: ImageLibraryOptions = {
            mediaType: 'photo',
            quality: 1,
        };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                Alert.alert('Error', 'Could not select image. Please try again.');
            } else if (response.assets && response.assets[0].uri) {
                setAvatarUri(response.assets[0].uri);
            }
        });
    };

    const handleChooseVideo = () => {
        const options: ImageLibraryOptions = {
            mediaType: 'video',
            quality: 1,
        };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled video picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                Alert.alert('Error', 'Could not select video. Please try again.');
            } else if (response.assets && response.assets[0].uri) {
                setVideoUri(response.assets[0].uri);
                Alert.alert("Video Selected", "Your video is ready to be uploaded.");
            }
        });
    };

    const handleSaveChanges = () => {
        Alert.alert("Profile Saved", "Your information has been updated!");
        navigation.goBack();
    };

    const getInitials = () => {
        if (user && user.email) {
            return user.email.substring(0, 2).toUpperCase();
        }
        return '??';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Profile</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity onPress={handleChooseAvatar}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{getInitials()}</Text>
                                </View>
                            )}
                            <View style={styles.avatarEditButton}>
                                <SvgXml xml={cameraIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.profileName}>{fullName || 'Alex Johnson'}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Media</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={handleChooseVideo}>
                        <SvgXml xml={uploadIcon} stroke="#6366F1" />
                        <Text style={styles.uploadButtonText}>Upload a Profile Video</Text>
                    </TouchableOpacity>
                    {/* --- THIS IS THE FIX --- */}
                    {videoUri ? (
                        <View style={styles.videoPreview}>
                            <Text style={styles.videoPreviewText}>Video selected and ready!</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Personal Information</Text>
                    <IconTextInput icon={userIcon} value={fullName} onChangeText={setFullName} placeholder="Full Name" />
                    <IconTextInput icon={phoneIcon} value={phone} onChangeText={setPhone} placeholder="Phone Number" keyboardType="phone-pad" />
                    <IconTextInput icon={locationIcon} value={location} onChangeText={setLocation} placeholder="Location (e.g., Palo Alto, CA)" />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Academic & Professional</Text>
                    <IconTextInput icon={universityIcon} value={university} onChangeText={setUniversity} placeholder="University" />
                    <IconTextInput icon={majorIcon} value={major} onChangeText={setMajor} placeholder="Major / Field of Study" />
                    <IconTextInput icon={calendarIcon} value={gradYear} onChangeText={setGradYear} placeholder="Graduation Year" keyboardType="numeric" />
                    <IconTextInput icon={githubIcon} value={github} onChangeText={setGithub} placeholder="GitHub Profile URL" autoCapitalize="none" />
                    <IconTextInput icon={skillsIcon} value={skills} onChangeText={setSkills} placeholder="Skills (comma-separated)" />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>About Me</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={aboutMe} onChangeText={setAboutMe} placeholder="Tell us about yourself, your interests, and career goals..." multiline placeholderTextColor="#9CA3AF" />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
                    <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

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
    avatarEditButton: {
        position: 'absolute',
        bottom: 15,
        right: 0,
        backgroundColor: '#4F46E5',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFFFFF'
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
        color: '#4B5563',
        fontStyle: 'italic'
    }
});

export default ProfileScreen;