import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    FlatList,
    Animated,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../components/AppHeader';
import auth from '@react-native-firebase/auth';
import { getLeaderboard } from '../api/api';

// --- Icons ---
const crownIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#FFD700" stroke="#B45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>`;
const trophyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 15h1.5a2.5 2.5 0 0 1 0 5H4"></path><path d="M19.5 15H18a2.5 2.5 0 0 0 0 5h1.5"></path><path d="M12 6V3"></path><path d="M12 21v-3"></path><path d="M9 12H3"></path><path d="M21 12h-6"></path><circle cx="12" cy="12" r="4"></circle></svg>`;
const starIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
const medalIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.61 2.14a2 2 0 0 1 .13 2.2L16.79 15"></path><path d="M11 12 5.12 2.2"></path><path d="m13 12 5.88-9.8"></path><path d="M8 7h8"></path><circle cx="12" cy="17" r="5"></circle><path d="m9 22 3-3 3 3"></path><path d="m9 22 3-3 3 3"></path></svg>`;

// --- Type definition for a user in the leaderboard ---
type LeaderboardUser = {
  _id: string;
  name: string;
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

    // --- State management ---
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
    const [showAllRankings, setShowAllRankings] = useState(false);

    // --- Function to fetch data ---
    const fetchLeaderboard = async () => {
        try {
            const response = await getLeaderboard();
            if (response.data && Array.isArray(response.data)) {
                const rankedData: LeaderboardUser[] = response.data.map((u, index) => ({
                    ...u,
                    rank: index + 1,
                }));
                setLeaderboard(rankedData);

                const myRank = rankedData.find(u => u._id === user?.uid);
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

    // --- Component for rendering each item ---
    const renderRankingItem = ({ item }: { item: LeaderboardUser }) => (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <View style={styles.rankingItem}>
                <View style={styles.rankingLeft}>
                    <View style={[styles.rankBadge, 
                        item.rank === 1 ? styles.goldRank : 
                        item.rank === 2 ? styles.silverRank : 
                        item.rank === 3 ? styles.bronzeRank : styles.defaultRank
                    ]}>
                        <Text style={[styles.rankingRank, 
                            item.rank <= 3 ? styles.topRankText : styles.defaultRankText
                        ]}>
                            {item.rank}
                        </Text>
                    </View>
                    <View style={styles.rankingAvatar}>
                        <Text style={styles.rankingAvatarText}>{getInitials(item.name)}</Text>
                    </View>
                </View>
                <View style={styles.rankingCenter}>
                    <Text style={styles.rankingName}>{item.name}</Text>
                    <View style={styles.pointsContainer}>
                        <SvgXml xml={starIcon} />
                        <Text style={styles.rankingInfo}>{item.points} pts</Text>
                    </View>
                </View>
                {item.rank <= 3 && (
                    <View style={styles.rankingRight}>
                        <SvgXml xml={medalIcon} stroke={
                            item.rank === 1 ? '#FFD700' : 
                            item.rank === 2 ? '#C0C0C0' : '#CD7F32'
                        } />
                    </View>
                )}
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
                data={showAllRankings ? leaderboard : leaderboard.slice(0, 3)}
                renderItem={renderRankingItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
                ListHeaderComponent={
                    <>
                        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={styles.headerGradient}
                            >
                                <View style={styles.headerContent}>
                                    <SvgXml xml={trophyIcon} />
                                    <View style={styles.headerTexts}>
                                        <Text style={styles.headerTitle}>Leaderboard</Text>
                                        <Text style={styles.headerSubtitle}>Competition is heating up! 🔥</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <LinearGradient
                                colors={['#4f46e5', '#7c3aed']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={styles.yourRankCard}
                            >
                                <View style={styles.yourRankContent}>
                                    <View style={styles.yourRankBadge}>
                                        <SvgXml xml={medalIcon} stroke="#FFFFFF" />
                                        <Text style={styles.yourRankNumber}>
                                            {currentUserRank ? `#${currentUserRank.rank}` : 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={styles.yourRankInfo}>
                                        <Text style={styles.yourRankLabel}>Your Ranking</Text>
                                        <View style={styles.pointsRow}>
                                            <SvgXml xml={starIcon} />
                                            <Text style={styles.yourRankPoints}>
                                                {currentUserRank ? currentUserRank.points : 0} pts
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        {leaderboard.length > 0 && (
                             <Animated.View style={[styles.podiumContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                                {/* 2nd Place */}
                                {second ? (
                                    <View style={[styles.podiumItem, { transform: [{ translateY: 20 }] }]}>
                                        <View style={styles.podiumAvatarContainer}>
                                            <View style={[styles.podiumAvatar, styles.silverBorder]}>
                                                <Text style={styles.podiumAvatarText}>{getInitials(second.name)}</Text>
                                            </View>
                                            <View style={styles.silverMedal}>
                                                <Text style={styles.medalText}>2</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.podiumName} numberOfLines={1}>{second.name}</Text>
                                        <Text style={styles.podiumPoints}>{second.points} pts</Text>
                                        <LinearGradient
                                            colors={['#E5E7EB', '#9CA3AF']}
                                            style={[styles.podiumPillar, styles.silverPillar]}
                                        >
                                            <Text style={styles.podiumRank}>2</Text>
                                        </LinearGradient>
                                    </View>
                                ) : <View style={styles.podiumItem} /> }
                                
                                {/* 1st Place */}
                                {first ? (
                                    <View style={styles.podiumItem}>
                                        <SvgXml xml={crownIcon} />
                                        <View style={styles.podiumAvatarContainer}>
                                            <View style={[styles.podiumAvatar, styles.goldBorder]}>
                                                <Text style={styles.podiumAvatarText}>{getInitials(first.name)}</Text>
                                            </View>
                                            <View style={styles.goldMedal}>
                                                <Text style={styles.medalText}>1</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.podiumName} numberOfLines={1}>{first.name}</Text>
                                        <Text style={styles.podiumPoints}>{first.points} pts</Text>
                                        <LinearGradient
                                            colors={['#FEF3C7', '#F59E0B']}
                                            style={[styles.podiumPillar, styles.goldPillar]}
                                        >
                                            <Text style={styles.podiumRank}>1</Text>
                                        </LinearGradient>
                                    </View>
                                ) : <View style={styles.podiumItem} /> }

                                {/* 3rd Place */}
                                {third ? (
                                    <View style={[styles.podiumItem, { transform: [{ translateY: 40 }] }]}>
                                        <View style={styles.podiumAvatarContainer}>
                                            <View style={[styles.podiumAvatar, styles.bronzeBorder]}>
                                                <Text style={styles.podiumAvatarText}>{getInitials(third.name)}</Text>
                                            </View>
                                            <View style={styles.bronzeMedal}>
                                                <Text style={styles.medalText}>3</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.podiumName} numberOfLines={1}>{third.name}</Text>
                                        <Text style={styles.podiumPoints}>{third.points} pts</Text>
                                        <LinearGradient
                                            colors={['#FDBA74', '#EA580C']}
                                            style={[styles.podiumPillar, styles.bronzePillar]}
                                        >
                                            <Text style={styles.podiumRank}>3</Text>
                                        </LinearGradient>
                                    </View>
                                ) : <View style={styles.podiumItem} /> }
                            </Animated.View>
                        )}
                        
                        <View style={styles.rankingsHeader}>
                            <Animated.Text style={[styles.listTitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>Rankings</Animated.Text>
                            {leaderboard.length > 3 && (
                                <TouchableOpacity onPress={() => setShowAllRankings(!showAllRankings)}>
                                    <Text style={styles.viewAllButton}>
                                        {showAllRankings ? 'Show Less' : 'View All'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
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
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#6B7280' },
    
    // --- Enhanced Header Styles ---
    headerGradient: {
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
    },
    headerTexts: {
        marginLeft: 16,
        flex: 1,
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 16, color: '#E0E7FF', marginTop: 4 },
    listContent: { paddingHorizontal: 20, paddingBottom: 20 },
    
    // --- Enhanced Your Rank Card ---
    yourRankCard: {
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    yourRankContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
    },
    yourRankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 20,
    },
    yourRankNumber: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginLeft: 8 },
    yourRankInfo: { flex: 1 },
    yourRankLabel: { color: '#E0E7FF', fontSize: 14, marginBottom: 8 },
    pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    yourRankPoints: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
    // --- Enhanced Podium Styles ---
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 32,
        height: 260,
        paddingHorizontal: 10,
    },
    podiumItem: { alignItems: 'center', width: 110, paddingHorizontal: 5 },
    podiumAvatarContainer: { position: 'relative', marginBottom: 12 },
    podiumAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    goldBorder: { borderColor: '#FFD700' },
    silverBorder: { borderColor: '#C0C0C0' },
    bronzeBorder: { borderColor: '#CD7F32' },
    podiumAvatarText: { color: '#4B5563', fontWeight: 'bold', fontSize: 22 },
    podiumName: { fontWeight: '700', color: '#1F2937', fontSize: 14, textAlign: 'center', marginBottom: 4 },
    podiumPoints: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 8 },
    podiumPillar: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    goldPillar: { height: 120 },
    silverPillar: { height: 100 },
    bronzePillar: { height: 80 },
    podiumRank: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
    
    // --- Medal Styles ---
    goldMedal: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        backgroundColor: '#FFD700',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    silverMedal: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        backgroundColor: '#C0C0C0',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    bronzeMedal: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        backgroundColor: '#CD7F32',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    medalText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
    listTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    
    // --- Enhanced Ranking Item Styles ---
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#E5E7EB',
    },
    rankingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    rankBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    goldRank: { backgroundColor: '#FFD700' },
    silverRank: { backgroundColor: '#C0C0C0' },
    bronzeRank: { backgroundColor: '#CD7F32' },
    defaultRank: { backgroundColor: '#E5E7EB' },
    rankingRank: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    topRankText: { color: '#FFFFFF' },
    defaultRankText: { color: '#6B7280' },
    rankingAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    rankingAvatarText: {
        color: '#374151',
        fontWeight: 'bold',
        fontSize: 16,
    },
    rankingCenter: {
        flex: 1,
        marginLeft: 4,
    },
    rankingName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rankingInfo: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    rankingRight: {
        marginLeft: 12,
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF'
    },
    rankingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllButton: {
        fontSize: 14,
        color: '#6366F1',
        fontWeight: '600',
    },
});

export default LeaderboardScreen;