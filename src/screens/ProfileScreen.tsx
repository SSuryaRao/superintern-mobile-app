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
    ActivityIndicator
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { SvgXml } from 'react-native-svg';
import { launchImageLibrary, ImageLibraryOptions, Asset } from 'react-native-image-picker';
import { getMyProfile, updateMyProfile, uploadIntroVideo } from '../api/api';

const userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
const phoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81 .7A2 2 0 0 1 22 16.92z"></path></svg>`;
const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
const locationIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
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

    useEffect(() => {
        const fetchProfile = async () => {
            try {
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
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                Alert.alert("Error", "Could not load your profile data.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChooseMedia = (mediaType: 'photo' | 'video', callback: (asset: Asset) => void) => {
        const options: ImageLibraryOptions = {
            mediaType,
            quality: 1,
            durationLimit: 60,
        } as any;

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled media picker');
                return;
            };
            if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                Alert.alert('Error', `Could not select ${mediaType}. Please try again.`);
                return;
            }
            if (response.assets && response.assets[0]) {
                callback(response.assets[0]);
            }
        });
    };

    const handleChooseAvatar = () => {
        handleChooseMedia('photo', (asset) => {
            setAvatarUri(asset.uri || null);
        });
    };

    const handleChooseVideo = () => {
        handleChooseMedia('video', async (asset) => {
            if (!asset.uri || !asset.fileName || !asset.type) {
                Alert.alert("Error", "Selected video file is invalid.");
                return;
            }

            setIsUploadingVideo(true);
            try {
                const formData = new FormData();
                formData.append('video', {
                    uri: asset.uri,
                    name: asset.fileName,
                    type: asset.type,
                });

                const response = await uploadIntroVideo(formData);
                
                Alert.alert("Success", "Your profile video has been uploaded!");

                if (response.data && response.data.videoUrl) {
                    setVideoUrl(response.data.videoUrl);
                } else {
                    getMyProfile().then(res => setVideoUrl(res.data.videoUrl || null));
                }

            } catch (error) {
                console.error("Video upload failed:", error);
                Alert.alert("Upload Failed", "Could not upload your video. Please try again.");
            } finally {
                setIsUploadingVideo(false);
            }
        });
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const profileData = {
                name: fullName,
                phone,
                github,
                location,
                aboutMe,
                skills: skills.split(',').map(s => s.trim()).filter(Boolean),
            };
            await updateMyProfile(profileData);
            Alert.alert("Profile Saved", "Your information has been updated!");
            navigation.goBack();
        } catch (error) {
            console.error("Failed to save profile:", error);
            Alert.alert("Error", "Could not save your profile.");
        } finally {
            setSaving(false);
        }
    };

    const getInitials = () => {
        if (fullName) return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        return user?.email?.substring(0, 2).toUpperCase() || '??';
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366F1" />
            </SafeAreaView>
        );
    }
   
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Profile</Text>
                    <TouchableOpacity onPress={handleSaveChanges}>
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
                        {/* <View style={styles.avatarEditButton}>             //Camera Icon Button
                            <SvgXml xml={cameraIcon} />
                        </View> */}
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{fullName || 'Your Name'}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Media</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={handleChooseVideo} disabled={isUploadingVideo}>
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
                            <Text style={styles.videoPreviewText}>A video has been uploaded.</Text>
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