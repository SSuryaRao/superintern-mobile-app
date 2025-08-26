import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Animated,
    TextInput,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import AppHeader from '../components/AppHeader';
import { getAllJobs } from '../api/api'; // Import the API function
import { formatDistanceToNow } from 'date-fns'; // Using a library for date formatting

// --- Icons ---
const searchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
const locationIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

// --- Corrected Type Definition for Job Data (with notes) ---
type Job = {
  _id: string;
  // NOTE: Based on API data, 'post' holds the Company Name
  post: string;
  // NOTE: 'companyName' holds the Job Title
  companyName: string;
  location: string;
  isRemote: boolean;
  type: string;
  createdAt: string; // This is an ISO date string
};

// --- Helper function to get initials ---
const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

// --- Corrected & Reusable Job List Item ---
const JobListItem = ({ item }: { item: Job }) => (
    <TouchableOpacity style={styles.jobCard}>
        <View style={styles.jobHeader}>
            <View style={styles.companyLogo}>
                {/* FIX: Use item.post for company initials */}
                <Text style={styles.companyLogoText}>{getInitials(item.post)}</Text>
            </View>
            <View style={{ flex: 1 }}>
                {/* FIX: Use item.companyName for the job title */}
                <Text style={styles.jobTitle} numberOfLines={2}>{item.companyName}</Text>
                {/* FIX: Use item.post for the company name */}
                <Text style={styles.jobCompany} numberOfLines={1}>{item.post}</Text>
            </View>
        </View>

        <View style={styles.tagContainer}>
            <View style={[styles.tag, styles.typeTag]}>
                <Text style={styles.tagText}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
            </View>
            <View style={[styles.tag, styles.locationTag]}>
                <Text style={styles.tagText}>{item.isRemote ? 'Remote' : 'Office'}</Text>
            </View>
        </View>

        <View style={styles.jobInfoRow}>
            <View style={styles.jobInfoItem}>
                <SvgXml xml={locationIcon} />
                <Text style={styles.jobInfoText}>{item.location}</Text>
            </View>
            <View style={styles.jobInfoItem}>
                <SvgXml xml={clockIcon} />
                <Text style={styles.jobInfoText}>
                    Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
);

const JobsScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // --- State Management ---
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Data Fetching ---
    const fetchJobs = async () => {
        try {
            const response = await getAllJobs();
            if (response.data && Array.isArray(response.data)) {
                setJobs(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        // Animations
        Animated.stagger(150, [
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, useNativeDriver: true }),
        ]).start();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchJobs();
    }, []);

    // Filter jobs based on search query
    const filteredJobs = jobs.filter(job =>
        job.post.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Finding Internships...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredJobs}
                    renderItem={({ item }) => (
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                            <JobListItem item={item} />
                        </Animated.View>
                    )}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
                    ListHeaderComponent={
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Find Your Internship</Text>
                                <Text style={styles.headerSubtitle}>Discover amazing opportunities to grow.</Text>
                            </View>
                            <View style={styles.searchContainer}>
                                <SvgXml xml={searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search by role or company..."
                                    placeholderTextColor="#9CA3AF"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                            <Text style={styles.sectionTitle}>Recent Postings</Text>
                        </Animated.View>
                    }
                    ListEmptyComponent={
                        !loading && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No job postings found.</Text>
                                <Text style={styles.emptySubText}>Check back later or try a different search.</Text>
                            </View>
                        )
                    }
                />
            )}
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#6B7280' },
    listContent: { paddingHorizontal: 20, paddingBottom: 20 },
    header: { marginBottom: 16 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
    headerSubtitle: { fontSize: 16, color: '#6B7280' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        paddingLeft: 12,
        fontSize: 16,
        color: '#111827',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    jobCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    jobHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    companyLogo: {
        width: 48,
        height: 48,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    companyLogoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4338CA',
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    jobCompany: {
        fontSize: 14,
        color: '#6B7280',
    },
    tagContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    tag: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 8,
    },
    typeTag: {
        backgroundColor: '#DBEAFE',
    },
    locationTag: {
        backgroundColor: '#E5E7EB',
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#374151'
    },
    jobInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    jobInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    jobInfoText: {
        marginLeft: 6,
        color: '#4B5563',
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    emptySubText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    }
});

export default JobsScreen;