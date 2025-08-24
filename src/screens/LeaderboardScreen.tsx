import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    FlatList,
    Animated,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import AppHeader from '../components/AppHeader';
import auth from '@react-native-firebase/auth';
import { getLeaderboard } from '../api/api'; // Import the API function

// --- Icons ---
const crownIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFD700" stroke="#B45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>`;

// --- Type definition for a user in the leaderboard ---
type LeaderboardUser = {
  _id: string;
  fullName: string;
  email: string;
  points: number;
  rank: number;
};

// --- Helper function to get initials from a name ---
const getInitials = (name: string) => {
    if (!name) return '??';
    const words = name.split(' ');
    return words.map(word => word[0]).join('').toUpperCase();
};

const LeaderboardScreen = () => {
    const user = auth().currentUser;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // --- State management for loading, refreshing, and data ---
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);

    // --- Function to fetch data from the backend ---
    const fetchLeaderboard = async () => {
        try {
            const response = await getLeaderboard();
            if (response.data && Array.isArray(response.data)) {
                // Map the raw data and add a 'rank' property
                const rankedData: LeaderboardUser[] = response.data.map((u, index) => ({
                    ...u,
                    rank: index + 1,
                }));
                setLeaderboard(rankedData);

                // Find the currently logged-in user in the list
                const myRank = rankedData.find(u => u.email === user?.email);
                setCurrentUserRank(myRank || null);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- Fetch data on component mount ---
    useEffect(() => {
        fetchLeaderboard();
        // Start animations
        Animated.stagger(150, [
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 7, useNativeDriver: true }),
        ]).start();
    }, []);

    // --- Handle pull-to-refresh ---
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchLeaderboard();
    }, []);

    // --- Component for rendering each item in the list ---
    const renderRankingItem = ({ item }: { item: LeaderboardUser }) => (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <View style={styles.rankingItem}>
                <Text style={styles.rankingRank}>{item.rank}</Text>
                <View style={styles.rankingAvatar}>
                    <Text style={styles.rankingAvatarText}>{getInitials(item.fullName)}</Text>
                </View>
                <View>
                    <Text style={styles.rankingName}>{item.fullName}</Text>
                    <Text style={styles.rankingInfo}>{item.points} pts</Text>
                </View>
            </View>
        </Animated.View>
    );

    // --- Loading State UI ---
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <AppHeader />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Loading Leaderboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const [first, second, third] = topThree;

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />
            <FlatList
                data={leaderboard.slice(3)} // Show ranks 4 and below in the list
                renderItem={renderRankingItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
                ListHeaderComponent={
                    <>
                        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <Text style={styles.headerTitle}>Leaderboard</Text>
                            <Text style={styles.headerSubtitle}>Competition is heating up! 🔥</Text>
                        </Animated.View>

                        <Animated.View style={[styles.yourRankCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <View>
                                <Text style={styles.yourRankLabel}>Your Ranking</Text>
                                <Text style={styles.yourRankNumber}>{currentUserRank ? `#${currentUserRank.rank}` : 'N/A'}</Text>
                            </View>
                            <View style={styles.yourRankPointsContainer}>
                                <Text style={styles.yourRankPoints}>{currentUserRank ? currentUserRank.points : 0}</Text>
                                <Text style={styles.yourRankLabel}>Points</Text>
                            </View>
                        </Animated.View>

                        {leaderboard.length > 0 && (
                             <Animated.View style={[styles.podiumContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                                {/* 2nd Place */}
                                {second && (
                                    <View style={[styles.podiumItem, { transform: [{ translateY: 20 }] }]}>
                                        <View style={[styles.podiumAvatar, styles.silverBorder]}><Text style={styles.podiumAvatarText}>{getInitials(second.fullName)}</Text></View>
                                        <Text style={styles.podiumName} numberOfLines={1}>{second.fullName}</Text>
                                        <View style={[styles.podiumPillar, styles.silverPillar]}><Text style={styles.podiumRank}>2</Text></View>
                                    </View>
                                )}
                                {/* 1st Place */}
                                {first && (
                                    <View style={styles.podiumItem}>
                                        <SvgXml xml={crownIcon} width={32} height={32} />
                                        <View style={[styles.podiumAvatar, styles.goldBorder]}><Text style={styles.podiumAvatarText}>{getInitials(first.fullName)}</Text></View>
                                        <Text style={styles.podiumName} numberOfLines={1}>{first.fullName}</Text>
                                        <View style={[styles.podiumPillar, styles.goldPillar]}><Text style={styles.podiumRank}>1</Text></View>
                                    </View>
                                )}
                                {/* 3rd Place */}
                                {third && (
                                    <View style={[styles.podiumItem, { transform: [{ translateY: 40 }] }]}>
                                        <View style={[styles.podiumAvatar, styles.bronzeBorder]}><Text style={styles.podiumAvatarText}>{getInitials(third.fullName)}</Text></View>
                                        <Text style={styles.podiumName} numberOfLines={1}>{third.fullName}</Text>
                                        <View style={[styles.podiumPillar, styles.bronzePillar]}><Text style={styles.podiumRank}>3</Text></View>
                                    </View>
                                )}
                            </Animated.View>
                        )}
                        
                        <Animated.Text style={[styles.listTitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>All Rankings</Animated.Text>
                    </>
                }
                 ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No rankings to display yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F5FF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#6B7280' },
    header: { paddingHorizontal: 20, marginBottom: 16 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
    headerSubtitle: { fontSize: 16, color: '#6B7280' },
    listContent: { paddingHorizontal: 20, paddingBottom: 20 },
    yourRankCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#6366F1',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
    },
    yourRankLabel: { color: '#E0E7FF', fontSize: 14 },
    yourRankNumber: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
    yourRankPointsContainer: { alignItems: 'flex-end' },
    yourRankPoints: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 32,
        height: 220,
    },
    podiumItem: { alignItems: 'center', width: 110, paddingHorizontal: 5 },
    podiumAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 3,
    },
    goldBorder: { borderColor: '#FBBF24' },
    silverBorder: { borderColor: '#D1D5DB' },
    bronzeBorder: { borderColor: '#F59E0B' },
    podiumAvatarText: { color: '#4B5563', fontWeight: 'bold', fontSize: 20 },
    podiumName: { fontWeight: '600', color: '#374151', fontSize: 12, textAlign: 'center' },
    podiumPillar: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    goldPillar: { height: 100, backgroundColor: '#FEF3C7' },
    silverPillar: { height: 80, backgroundColor: '#F3F4F6' },
    bronzePillar: { height: 60, backgroundColor: '#FFE4E6' },
    podiumRank: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
    listTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    rankingRank: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6B7280',
        width: 30,
    },
    rankingAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankingAvatarText: {
        color: '#4338CA',
        fontWeight: 'bold',
    },
    rankingName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    rankingInfo: {
        fontSize: 12,
        color: '#6B7280',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF'
    },
});

export default LeaderboardScreen;