import React, { useEffect, useRef } from 'react';
import { SafeAreaView, Text, View, StyleSheet, ScrollView, TouchableOpacity, Animated, TextInput } from 'react-native';
import { SvgXml } from 'react-native-svg';
import AppHeader from '../components/AppHeader';
import LinearGradient from 'react-native-linear-gradient';

// --- Icons ---
const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
const searchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
const starIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

const myJobs = [
    { title: 'Frontend Development Intern', status: 'Active', applicants: 15 },
    { title: 'Data Analytics Intern', status: 'Draft', applicants: 0 },
];

const HireScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.stagger(150, [
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Recruiter Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Manage postings and find top talent.</Text>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <TouchableOpacity>
                        <LinearGradient
                            colors={['#8B5CF6', '#6366F1']}
                            style={styles.postJobButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <SvgXml xml={plusIcon} />
                            <View>
                                <Text style={styles.postJobButtonTitle}>Post a New Job</Text>
                                <Text style={styles.postJobButtonSubtitle}>Reach thousands of interns</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.cardTitle}>My Job Postings</Text>
                    {myJobs.map((job, index) => (
                        <View key={index} style={styles.myJobCard}>
                            <View>
                                <Text style={styles.myJobTitle}>{job.title}</Text>
                                <View style={styles.jobStatusRow}>
                                    <View style={[styles.statusBadge, job.status === 'Active' ? styles.activeBadge : styles.draftBadge]}>
                                        <Text style={[styles.statusBadgeText, job.status === 'Active' ? styles.activeBadgeText : styles.draftBadgeText]}>{job.status}</Text>
                                    </View>
                                    <Text style={styles.applicantsText}>{job.applicants} applicants</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.viewButton}>
                                <Text style={styles.viewButtonText}>View</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </Animated.View>

                <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.cardTitle}>Find Top Interns</Text>
                    <View style={styles.searchContainer}>
                        <SvgXml xml={searchIcon} />
                        <TextInput style={styles.searchInput} placeholder="Search by skill, university..." placeholderTextColor="#9CA3AF" />
                    </View>
                    <View style={styles.topInternCard}>
                        <View style={styles.topInternHeader}>
                            <View style={styles.topInternAvatar}><Text style={styles.topInternAvatarText}>SC</Text></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.topInternName}>Sarah Chen</Text>
                                <Text style={styles.topInternSchool}>Stanford University</Text>
                            </View>
                            <View style={styles.ratingContainer}>
                                <SvgXml xml={starIcon} />
                                <Text style={styles.ratingText}>4.9</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F5FF' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
    header: { marginBottom: 24 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
    headerSubtitle: { fontSize: 16, color: '#6B7280' },
    postJobButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 20,
        marginBottom: 24,
    },
    postJobButtonTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 16 },
    postJobButtonSubtitle: { fontSize: 14, color: '#E0E7FF', marginLeft: 16 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
    },
    myJobCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    myJobTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    jobStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
    activeBadge: { backgroundColor: '#D1FAE5' },
    draftBadge: { backgroundColor: '#F3F4F6' },
    statusBadgeText: { fontSize: 12, fontWeight: '500' },
    activeBadgeText: { color: '#065F46' },
    draftBadgeText: { color: '#374151' },
    applicantsText: { fontSize: 14, color: '#6B7280' },
    viewButton: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    viewButtonText: { color: '#374151', fontWeight: '500' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        paddingLeft: 12,
        fontSize: 16,
        color: '#111827',
    },
    topInternCard: {
        backgroundColor: '#FFFBEB',
        borderRadius: 16,
        padding: 16,
    },
    topInternHeader: { flexDirection: 'row', alignItems: 'center' },
    topInternAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    topInternAvatarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    topInternName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    topInternSchool: { fontSize: 14, color: '#6B7280' },
    ratingContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginLeft: 'auto',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: { fontSize: 14, fontWeight: 'bold', color: '#1F2937', marginLeft: 4 },
});

export default HireScreen;