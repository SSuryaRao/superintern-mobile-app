import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Animated,
    ScrollView,
    TextInput,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import AppHeader from '../components/AppHeader';
import LinearGradient from 'react-native-linear-gradient';
import { getAllJobs } from '../api/api'; // Import the API function

// --- Icons ---
const searchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
const locationIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

// --- Type Definition for Job Data from API ---
type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  duration?: string; // Optional field
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  image?: string; // Optional field, provide a fallback
  featured?: boolean;
  skills: string[];
};

// --- Reusable UI Components for this screen ---

const FeaturedJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity>
        <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            style={styles.featuredCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.featuredHeader}>
                <Image 
                    source={{ uri: item.image || 'https://placehold.co/100x100/E0E7FF/4338CA?text=Job' }} 
                    style={styles.featuredLogo} 
                />
                <Text style={styles.featuredType}>{item.type}</Text>
            </View>
            <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.featuredCompany}>{item.company}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

const JobListItem = ({ item }: { item: Job }) => (
    <TouchableOpacity style={styles.jobCard}>
        <View style={styles.jobHeader}>
            <Image 
                source={{ uri: item.image || 'https://placehold.co/100x100/E0E7FF/4338CA?text=Job' }} 
                style={styles.companyLogo} 
            />
            <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.jobCompany}>{item.company}</Text>
            </View>
            <Text style={styles.jobSalary}>{item.salary}</Text>
        </View>
        <View style={styles.jobInfoRow}>
            <View style={styles.jobInfoItem}>
                <SvgXml xml={locationIcon} />
                <Text style={styles.jobInfoText}>{item.location}</Text>
            </View>
            {item.duration && (
                <View style={styles.jobInfoItem}>
                    <SvgXml xml={clockIcon} />
                    <Text style={styles.jobInfoText}>{item.duration}</Text>
                </View>
            )}
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
            // Later, you can pass search parameters here: getAllJobs({ q: searchQuery })
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
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, useNativeDriver: true }),
        ]).start();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchJobs();
    }, []);

    // Filter jobs for different sections of the UI
    const featuredJobs = jobs.filter(job => job.featured);
    const regularJobs = jobs.filter(job => !job.featured);

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
                    data={regularJobs}
                    renderItem={({ item }) => (
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                            <JobListItem item={item} />
                        </Animated.View>
                    )}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
                    ListHeaderComponent={
                        <>
                            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                <View style={styles.header}>
                                    <Text style={styles.headerTitle}>Find Your Internship</Text>
                                    <Text style={styles.headerSubtitle}>Discover amazing opportunities to grow.</Text>
                                </View>
                                <View style={styles.searchContainer}>
                                    <SvgXml xml={searchIcon} />
                                    <TextInput 
                                        style={styles.searchInput} 
                                        placeholder="Search for jobs, companies..." 
                                        placeholderTextColor="#9CA3AF"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        // You can add onSubmitEditing to trigger a search
                                    />
                                </View>
                            </Animated.View>

                            {featuredJobs.length > 0 && (
                                <Animated.View style={{ opacity: fadeAnim }}>
                                    <Text style={styles.sectionTitle}>For You</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
                                        {featuredJobs.map(job => <FeaturedJobCard key={job._id} item={job} />)}
                                    </ScrollView>
                                </Animated.View>
                            )}
                            
                            <Animated.Text style={[styles.sectionTitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                                Recent Postings
                            </Animated.Text>
                        </>
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F5FF' },
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
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 24,
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
    featuredScroll: {
        marginHorizontal: -20, // Allows cards to bleed to the edge
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    featuredCard: {
        width: 280,
        height: 160,
        borderRadius: 20,
        padding: 20,
        marginRight: 16,
        justifyContent: 'space-between',
    },
    featuredHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    featuredLogo: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    featuredType: {
        color: '#FFFFFF',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: '500',
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    featuredCompany: {
        fontSize: 14,
        color: '#E0E7FF',
    },
    jobCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    jobHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    companyLogo: {
        width: 44,
        height: 44,
        borderRadius: 10,
        marginRight: 12,
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
    jobSalary: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    jobInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    jobInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
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