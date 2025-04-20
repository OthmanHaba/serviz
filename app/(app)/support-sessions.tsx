import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, FAB, Badge, Appbar, Modal, Portal, TextInput } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SupportSession, getSupportSessions, createSupportSession } from '@/lib/api/support';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupportSessionsScreen() {
    const [sessions, setSessions] = useState<SupportSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newSessionSubject, setNewSessionSubject] = useState('');
    const [newSessionMessage, setNewSessionMessage] = useState('');
    const [creatingSession, setCreatingSession] = useState(false);
    const theme = useTheme();
    const router = useRouter();


    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        setLoading(true);
        try {
            const res = await getSupportSessions();
            setSessions(res.data.sessions);



            console.log(sessions.length);

        } catch (error) {
            console.error('Error loading support sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadSessions();
        setRefreshing(false);
    };

    const handleCreateNewSession = () => {
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setNewSessionSubject('');
        setNewSessionMessage('');
    };

    const handleSubmitNewSession = async () => {
        if (!newSessionSubject.trim()) {
            return;
        }

        setCreatingSession(true);
        try {
            await createSupportSession(newSessionSubject);
            setLoading(true);
            const response = await getSupportSessions();
            setSessions(response.data.sessions)
        } catch (error) {
            console.error('Error creating support session:', error);
        } finally {
            handleCloseModal();
            setCreatingSession(false);
            setLoading(false);
        }
    };

    const handleOpenSession = (sessionId: number) => {
        router.push(`/support/${sessionId}`);
    };

    const getStatusColor = (status: 'open' | 'close') => {
        return status === 'open' ? theme.colors.primary : theme.colors.outline;
    };

    const getStatusText = (status: 'open' | 'close') => {
        return status === 'open' ? 'مفتوح' : 'مغلق';
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

            if (diffMinutes < 60) {
                return `منذ ${diffMinutes} دقيقة`;
            }

            const diffHours = Math.floor(diffMinutes / 60);
            if (diffHours < 24) {
                return `منذ ${diffHours} ساعة`;
            }

            const diffDays = Math.floor(diffHours / 24);
            if (diffDays < 30) {
                return `منذ ${diffDays} يوم`;
            }

            const diffMonths = Math.floor(diffDays / 30);
            return `منذ ${diffMonths} شهر`;
        } catch (error) {
            return 'تاريخ غير صالح';
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 16 }}>جاري تحميل المحادثات...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {sessions.length === 0 || !sessions.length ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="chat-remove" size={64} color={theme.colors.outline} />
                        <Text style={styles.emptyText}>لا توجد محادثات دعم</Text>
                        <Button
                            mode="contained"
                            onPress={handleCreateNewSession}
                            style={styles.newSessionButton}
                        >
                            إنشاء محادثة جديدة
                        </Button>
                    </View>
                ) : (
                    sessions.map((session) => (
                        <Card
                            key={session.id}
                            style={styles.sessionCard}
                            onPress={() => handleOpenSession(session.id)}
                        >
                            <Card.Content>
                                <View style={styles.cardHeader}>
                                    <Text variant="titleMedium">{session.subject}</Text>
                                    <Badge
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: getStatusColor(session.status) }
                                        ]}
                                    >
                                        {getStatusText(session.status)}
                                    </Badge>
                                </View>

                                <View style={styles.metadataContainer}>
                                    <View style={styles.metadataItem}>
                                        <MaterialCommunityIcons
                                            name="message-text"
                                            size={16}
                                            color={theme.colors.outline}
                                        />
                                        <Text variant="bodySmall" style={styles.metadataText}>
                                            {session.messageCount} رسائل
                                        </Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}
            </ScrollView>

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={handleCreateNewSession}
            />

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={handleCloseModal}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Text variant="headlineSmall" style={styles.modalTitle}>
                        إنشاء محادثة دعم جديدة
                    </Text>

                    <TextInput
                        label="الموضوع"
                        value={newSessionSubject}
                        onChangeText={setNewSessionSubject}
                        style={styles.input}
                        autoFocus
                        right={<TextInput.Icon icon="format-title" />}
                    />

                    <View style={styles.modalActions}>
                        <Button
                            onPress={handleCloseModal}
                            style={styles.modalButton}
                        >
                            إلغاء
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSubmitNewSession}
                            loading={creatingSession}
                            disabled={creatingSession || !newSessionSubject.trim()}
                            style={styles.modalButton}
                        >
                            إنشاء
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 16,
        paddingBottom: 80, // Extra padding for FAB
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        marginTop: 80,
    },
    emptyText: {
        marginTop: 16,
        marginBottom: 24,
        fontSize: 16,
        color: '#666',
    },
    newSessionButton: {
        marginTop: 16,
    },
    sessionCard: {
        marginBottom: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusBadge: {
        borderRadius: 4,
    },
    metadataContainer: {
        marginTop: 8,
    },
    metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    metadataText: {
        marginLeft: 6,
        color: '#666',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        margin: 20,
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    modalButton: {
        marginHorizontal: 8,
    },
});
