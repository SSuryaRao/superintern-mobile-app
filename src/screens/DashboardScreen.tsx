import React, { useEffect, useRef, useState } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    Animated,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import AppHeader from '../components/AppHeader';
import { getAuth } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import {
    getMyProfile,
    getAvailableTasks,
    getMyAssignedTasks,
    applyForTask,
    getLeaderboard
} from '../api/api';

// --- Icons ---
const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const starIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
const trophyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 15h1.5a2.5 2.5 0 0 1 0 5H4"></path><path d="M19.5 15H18a2.5 2.5 0 0 0 0 5h1.5"></path><path d="M12 6V3"></path><path d="M12 21v-3"></path><path d="M9 12H3"></path><path d="M21 12h-6"></path><circle cx="12" cy="12" r="4"></circle></svg>`;
const sendIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

interface UserProfile {
    id: string;
    email: string;
    fullName?: string;
    points: number;
    tasksCompleted: number;
    rank?: number;
}

interface Task {
    _id: string;
    title: string;
    description: string;
    points: number;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    status?: string;
    deadline?: string;
}

const DashboardScreen = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const navigation = useNavigation();
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
    const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
    const [leaderboardPosition, setLeaderboardPosition] = useState<number>(0);
    const [applyingTaskId, setApplyingTaskId] = useState<string | null>(null);
    const [showAllTasks, setShowAllTasks] = useState(false); // New state to toggle tasks visibility

    useEffect(() => {
        fetchDashboardData();
        
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

    useEffect(() => {
        if (userProfile) {
            const progress = calculateProgress();
            Animated.timing(progressAnim, {
                toValue: progress,
                duration: 1000,
                useNativeDriver: false,
            }).start();
        }
    }, [userProfile]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const [profileRes, tasksRes, assignedRes, leaderboardRes] = await Promise.all([
                getMyProfile(),
                getAvailableTasks(),
                getMyAssignedTasks(),
                getLeaderboard()
            ]);

            if (profileRes.data) {
                setUserProfile(profileRes.data);
            }

            if (tasksRes.data && Array.isArray(tasksRes.data)) {
                setAvailableTasks(tasksRes.data);
            }

            if (assignedRes.data && Array.isArray(assignedRes.data)) {
                setAssignedTasks(assignedRes.data);
            }

            if (leaderboardRes.data && Array.isArray(leaderboardRes.data)) {
                const userPosition = leaderboardRes.data.findIndex(
                    (u: any) => u.email === user?.email
                ) + 1;
                setLeaderboardPosition(userPosition || 0);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const handleApplyForTask = async (taskId: string) => {
        try {
            setApplyingTaskId(taskId);
            const response = await applyForTask(taskId);
            
            if (response.data) {
                Alert.alert('Success', 'You have successfully applied for this task!');
                fetchDashboardData();
            }
        } catch (error: any) {
            console.error('Error applying for task:', error);
            const errorMessage = error.response?.data?.message || 'Failed to apply for task. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setApplyingTaskId(null);
        }
    };

    const calculateProgress = () => {
        if (!userProfile) return 0;
        return Math.min((userProfile.tasksCompleted / 10) * 100, 100);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const getUserName = () => {
        if (userProfile?.fullName) {
            return userProfile.fullName.split(' ')[0];
        }
        return user?.displayName || user?.email?.split('@')[0] || 'Intern';
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const getDifficultyColor = (difficulty: string = 'Easy') => {
        switch (difficulty) {
            case 'Easy': return '#10B981';
            case 'Medium': return '#F59E0B';
            case 'Hard': return '#EF4444';
            default: return '#6B7280';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <AppHeader />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Loading your dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <AppHeader />
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#6366F1']}
                    />
                }
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={styles.greetingCard}>
                        <View>
                            <Text style={styles.greetingTitle}>{getGreeting()}!</Text>
                            <Text style={styles.greetingName}>{getUserName()}</Text>
                        </View>
                        <SvgXml xml={sunIcon} width={40} height={40} />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.cardTitle}>Your Progress</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <SvgXml xml={starIcon} width={28} height={28} />
                            <Text style={styles.statValue}>{userProfile?.points || 0}</Text>
                            <Text style={styles.statLabel}>Points</Text>
                        </View>
                        <View style={styles.statItem}>
                            <SvgXml xml={trophyIcon} width={28} height={28} />
                            <Text style={styles.statValue}>
                                {leaderboardPosition > 0 ? `#${leaderboardPosition}` : '-'}
                            </Text>
                            <Text style={styles.statLabel}>Rank</Text>
                        </View>
                    </View>
                    <View style={styles.progressWrapper}>
                        <Text style={styles.progressLabel}>Task Completion</Text>
                        <View style={styles.progressBarBackground}>
                            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
                        </View>
                        <Text style={styles.progressPercent}>
                            {userProfile?.tasksCompleted || 0} tasks completed
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.cardTitle}>Available Tasks</Text>
                        {availableTasks.length > 2 && (
                            <TouchableOpacity onPress={() => setShowAllTasks(!showAllTasks)}>
                                <Text style={styles.viewAllText}>{showAllTasks ? 'Show Less' : 'View All'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {availableTasks.length > 0 ? (
                        (showAllTasks ? availableTasks : availableTasks.slice(0, 2)).map((task) => (
                            <View key={task._id} style={styles.taskItem}>
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <View style={styles.taskMeta}>
                                        <Text style={styles.taskPoints}>⭐ {task.points} pts</Text>
                                        <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(task.difficulty)}20` }]}>
                                            <Text style={[styles.difficultyText, { color: getDifficultyColor(task.difficulty) }]}>
                                                {task.difficulty || 'Easy'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    style={styles.applyButton}
                                    onPress={() => handleApplyForTask(task._id)}
                                    disabled={applyingTaskId === task._id}
                                >
                                    {applyingTaskId === task._id ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <SvgXml xml={sendIcon} width={16} height={16} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No tasks available at the moment</Text>
                    )}
                </Animated.View>

                {assignedTasks.length > 0 && (
                    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.cardTitle}>Your Active Tasks</Text>
                        {assignedTasks.slice(0, 2).map((task) => (
                            <View key={task._id} style={styles.activeTaskItem}>
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <View style={styles.taskMeta}>
                                        {task.status === 'completed' ? (
                                            <View style={styles.completedBadge}>
                                                <SvgXml xml={checkIcon} width={14} height={14} />
                                                <Text style={styles.completedText}>Completed</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.inProgressBadge}>
                                                <SvgXml xml={clockIcon} width={14} height={14} />
                                                <Text style={styles.inProgressText}>In Progress</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F5FF' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    greetingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
    },
    greetingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#92400E',
    },
    greetingName: {
        fontSize: 16,
        color: '#B45309',
        marginTop: 4,
    },
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
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    viewAllText: {
        fontSize: 14,
        color: '#6366F1',
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    progressWrapper: {},
    progressLabel: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 8,
    },
    progressBarBackground: {
        height: 12,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#8B5CF6',
        borderRadius: 6,
    },
    progressPercent: {
        alignSelf: 'flex-end',
        marginTop: 4,
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    taskInfo: {
        flex: 1,
        marginRight: 12,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    taskPoints: {
        fontSize: 14,
        color: '#6B7280',
    },
    difficultyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: '#6366F1',
        padding: 12,
        borderRadius: 25,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTaskItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    completedText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
    inProgressBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    inProgressText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        paddingVertical: 20,
    },
});

export default DashboardScreen;