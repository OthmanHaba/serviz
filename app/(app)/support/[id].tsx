import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Appbar, Avatar, TextInput, IconButton, ActivityIndicator, Divider, Card } from 'react-native-paper';
import { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getSupportSessionDetails, SupportSession, sendSupportMessage } from '@/lib/api/support';

interface Message {
    id: number;
    sender: {
        id: number;
        name: string;
    };
    message: string;
    created_at: string;
}

interface SessionDetails {
    session: SupportSession
    messages: Message[];
}

export default function SupportSessionDetailsScreen() {
    const { id } = useLocalSearchParams();
    const sessionId = typeof id === 'string' ? parseInt(id, 10) : Number(id);
    const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadSessionDetails();
        
        refreshIntervalRef.current = setInterval(() => {
            if (!sending) {
                refreshMessages();
            }
        }, 3000);
        
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [sessionId]);

    const loadSessionDetails = async () => {
        setLoading(true);
        try {
            const response = await getSupportSessionDetails(sessionId);
            setSessionDetails(response.data);
        } catch (error) {
            console.error('Error loading session details:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const refreshMessages = async () => {
        try {
            const response = await getSupportSessionDetails(sessionId);
            
            // Only update if there are new messages
            if (sessionDetails && 
                response.data.messages.length > sessionDetails.messages.length) {
                setSessionDetails(response.data);
                
                // Scroll to bottom when new messages are loaded
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        } catch (error) {
            console.error('Error refreshing messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        
        setSending(true);
        try {
            await sendSupportMessage(sessionId, newMessage);
            
            // Reload the session details to get the new message
            const response = await getSupportSessionDetails(sessionId);
            setSessionDetails(response.data);
            
            // Clear the input
            setNewMessage('');
            
            // Scroll to bottom after adding the new message
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return '';
        }
    };

    // Check if this is the first message or if the date changes from the previous message
    const shouldShowDate = (messages: Message[], index: number) => {
        if (index === 0) return true;
        
        const currentDate = new Date(messages[index].created_at).toDateString();
        const prevDate = new Date(messages[index - 1].created_at).toDateString();
        
        return currentDate !== prevDate;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>جاري تحميل المحادثة...</Text>
            </SafeAreaView>
        );
    }

    if (!sessionDetails) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={64} color="#F87171" />
                <Text style={styles.errorText}>لا يمكن تحميل تفاصيل المحادثة</Text>
                <IconButton
                    icon="arrow-left"
                    mode="contained"
                    onPress={() => router.back()}
                    style={styles.backButton}
                />
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <Appbar.Header>
                    <Appbar.Content title={sessionDetails.session.subject} />
                    <Appbar.Action
                        icon={sessionDetails.session.status === 'open' ? 'lock-open-variant' : 'lock'}
                        disabled={sessionDetails.session.status !== 'open'}
                    />
                </Appbar.Header>

                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.messagesContainer}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
                >
                    {sessionDetails.messages.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="chat-outline" size={64} color="#9CA3AF" />
                            <Text style={styles.emptyText}>لا توجد رسائل بعد</Text>
                        </View>
                    ) : (
                        sessionDetails.messages.map((message, index) => (
                            <View key={message.id}>
                                {shouldShowDate(sessionDetails.messages, index) && (
                                    <View style={styles.dateContainer}>
                                        <Text style={styles.dateText}>{formatDate(message.created_at)}</Text>
                                    </View>
                                )}

                                <View
                                    style={[
                                        styles.messageRow,
                                        message.sender.id === 1 ? styles.userMessageRow : styles.supportMessageRow
                                    ]}
                                >
                                    {message.sender.id !== 1 && (
                                        <Avatar.Text
                                            size={36}
                                            label={message.sender.name.substring(0, 2)}
                                            style={styles.avatar}
                                        />
                                    )}

                                    <View
                                        style={[
                                            styles.messageBubble,
                                            message.sender.id === 1 ? styles.userBubble : styles.supportBubble
                                        ]}
                                    >
                                        <Text style={styles.senderName}>{message.sender.name}</Text>
                                        <Text style={styles.messageText}>{message.message}</Text>
                                        <Text style={styles.messageTime}>{formatTime(message.created_at)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>

                {sessionDetails.session.status === 'open' && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="اكتب رسالتك هنا..."
                            mode="outlined"
                            multiline
                            style={styles.input}
                            right={
                                <TextInput.Icon
                                    icon="send"
                                    onPress={handleSendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    forceTextInputFocus={false}
                                />
                            }
                        />
                    </View>
                )}

                {sessionDetails.session.status !== 'open' && (
                    <Card style={styles.closedSessionCard}>
                        <Card.Content>
                            <Text style={styles.closedSessionText}>
                                تم إغلاق هذه المحادثة ولا يمكن إضافة رسائل جديدة
                            </Text>
                        </Card.Content>
                    </Card>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        marginTop: 16,
        marginBottom: 24,
        fontSize: 16,
    },
    backButton: {
        marginTop: 24,
    },
    messagesContainer: {
        padding: 16,
        paddingBottom: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 16,
        color: '#6B7280',
    },
    dateContainer: {
        alignItems: 'center',
        marginVertical: 12,
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 12,
        maxWidth: '80%',
    },
    userMessageRow: {
        alignSelf: 'flex-end',
    },
    supportMessageRow: {
        alignSelf: 'flex-start',
    },
    avatar: {
        marginRight: 8,
        alignSelf: 'flex-end',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
    },
    userBubble: {
        backgroundColor: '#CFD8DC',
        borderBottomRightRadius: 4,
    },
    supportBubble: {
        backgroundColor: '#BBDEFB',
        borderBottomLeftRadius: 4,
    },
    senderName: {
        fontWeight: 'bold',
        marginBottom: 4,
        fontSize: 14,
    },
    messageText: {
        fontSize: 16,
    },
    messageTime: {
        fontSize: 10,
        color: '#6B7280',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    inputContainer: {
        padding: 8,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    input: {
        maxHeight: 120,
    },
    closedSessionCard: {
        margin: 16,
    },
    closedSessionText: {
        textAlign: 'center',
        color: '#6B7280',
    },
});
