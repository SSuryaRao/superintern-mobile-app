import React, { useState, useEffect, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
    TouchableOpacity,
    ListRenderItemInfo,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import AppHeader from '../components/AppHeader';
import { getMyApplications } from '../api/api';
import { useFocusEffect } from '@react-navigation/native';

// --- Icons ---
const checkCircleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
const xCircleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
const emptyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="9" y2="9.01"></line><line x1="15" y1="9" x2="15" y2="9.01"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>`;

// --- Type Definitions ---
interface TaskInfo {
    _id: string;
    title: string;
    description: string;
    points: number;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
}
type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'completed';
interface Application {
    _id: string;
    task: TaskInfo;
    status: ApplicationStatus;
}

const MyTasksScreen: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    useFocusEffect(
        useCallback(() => {
            fetchApplications();
        }, [])
    );

    const fetchApplications = async () => {
        try {
            if (!refreshing) setLoading(true);
            const response = await getMyApplications();
            if (response.data && Array.isArray(response.data)) {
                setApplications(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch applications:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchApplications();
    };

    const getStatusInfo = (status: ApplicationStatus) => {
        switch (status) {
            case 'approved':
            case 'completed':
                return { icon: checkCircleIcon, text: 'Approved', color: '#10B981' };
            case 'rejected':
                return { icon: xCircleIcon, text: 'Rejected', color: '#EF4444' };
            case 'pending':
            default:
                return { icon: clockIcon, text: 'Pending', color: '#F59E0B' };
        }
    };

    const getDifficultyColor = (difficulty: string = 'Easy') => {
        switch (difficulty) {
            case 'Easy': return '#10B981';
            case 'Medium': return '#F59E0B';
            case 'Hard': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const renderTaskItem = ({ item }: ListRenderItemInfo<Application>) => {
        const statusInfo = getStatusInfo(item.status);
        return (
            <View style={styles.taskItem}>
                <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{item.task?.title || 'Untitled Task'}</Text>
                    <Text style={styles.taskDescription} numberOfLines={2}>{item.task?.description || 'No description available'}</Text>
                    <View style={styles.taskMeta}>
                        <Text style={styles.taskPoints}>⭐ {item.task?.points || 0} pts</Text>
                        {item.task?.difficulty && (
                            <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(item.task.difficulty)}20` }]}>
                                <Text style={[styles.difficultyText, { color: getDifficultyColor(item.task.difficulty) }]}>
                                    {item.task.difficulty}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                    <SvgXml xml={statusInfo.icon} width={14} height={14} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                </View>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <AppHeader />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Loading your tasks...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <AppHeader />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Tasks</Text>
                <Text style={styles.headerSubtitle}>Track your task applications and their status</Text>
            </View>
            <FlatList
                data={applications}
                keyExtractor={(item) => item._id}
                renderItem={renderTaskItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <SvgXml xml={emptyIcon} />
                        <Text style={styles.emptyTitle}>No Applications Yet</Text>
                        <Text style={styles.emptyText}>Apply for tasks on the dashboard to see them here.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F5FF' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 10, fontSize: 16, color: '#6B7280' },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    listContent: { padding: 20, flexGrow: 1 },
    taskItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    taskInfo: { flex: 1, marginBottom: 12 },
    taskTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 },
    taskDescription: { fontSize: 14, color: '#6B7280', marginBottom: 8, lineHeight: 20 },
    taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    taskPoints: { fontSize: 14, color: '#6B7280' },
    difficultyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    difficultyText: { fontSize: 12, fontWeight: '600' },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
        alignSelf: 'flex-start',
    },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default MyTasksScreen;