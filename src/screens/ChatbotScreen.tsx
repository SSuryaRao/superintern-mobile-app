// src/screens/ChatbotScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import AppHeader from '../components/AppHeader';
import { getAuth } from '@react-native-firebase/auth';
import { 
    getAdminsForChat, // MODIFIED: Import the new function
    startOrGetChat, 
    getChatMessages, 
    sendMessage 
} from '../api/api';

// --- Icons (remain the same) ---
const sendIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
const botIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>`;
const userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;


interface Message {
    _id: string;
    content: string;
    sender: string;
    senderType: 'user' | 'bot';
    timestamp: string;
    isTyping?: boolean;
}

const ChatbotScreen = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const flatListRef = useRef<FlatList>(null);
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [adminId, setAdminId] = useState<string | null>(null); // MODIFIED: State for admin ID
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        initializeChat();
    }, []);

    // MODIFIED: This function is completely updated
    const initializeChat = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch the list of admin users
            const adminResponse = await getAdminsForChat();
            
            if (adminResponse.data && adminResponse.data.length > 0) {
                // 2. Take the first admin as the chat partner
                const firstAdmin = adminResponse.data[0];
                setAdminId(firstAdmin._id);
                
                // 3. Start or get the chat using the admin's valid ID
                const chatResponse = await startOrGetChat(firstAdmin._id);
                
                if (chatResponse.data && chatResponse.data._id) {
                    setCurrentChatId(chatResponse.data._id);
                    await loadMessages(chatResponse.data._id);
                }
            } else {
                 // If no admin is found, show an error message.
                 setMessages([{
                    _id: '1',
                    content: "Sorry, no support staff is available at the moment. Please try again later.",
                    sender: 'System',
                    senderType: 'bot',
                    timestamp: new Date().toISOString()
                }]);
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
            setMessages([{
                _id: '1',
                content: "I'm having trouble connecting to support. Please check your connection and try again.",
                sender: 'System',
                senderType: 'bot',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (chatId: string) => {
        try {
            const response = await getChatMessages(chatId);
            if (response.data && Array.isArray(response.data.messages)) {
                const formattedMessages: Message[] = response.data.messages.map((msg: any) => ({
                    _id: msg._id,
                    content: msg.content,
                    sender: msg.sender._id === user?.uid ? 'You' : 'Support',
                    senderType: msg.sender._id === user?.uid ? 'user' as const : 'bot' as const,
                    timestamp: msg.timestamp
                }));
                setMessages(formattedMessages);
            } else {
                 // If there are no messages, start with a welcome message
                 setMessages([{
                    _id: '1',
                    content: "Hello! I'm here to help. How can I assist you with your internship journey today?",
                    sender: 'Support',
                    senderType: 'bot',
                    timestamp: new Date().toISOString()
                }]);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    // MODIFIED: This function is updated for clarity and robustness
    const handleSend = async () => {
        if (!inputText.trim() || sending || !adminId) return;

        const userMessage: Message = {
            _id: Date.now().toString(),
            content: inputText.trim(),
            sender: 'You',
            senderType: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        const messageToSend = inputText;
        setInputText('');
        setSending(true);
        setIsTyping(true);

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            let chatId = currentChatId;
            // If chatId is somehow lost, re-establish it
            if (!chatId) {
                const chatResponse = await startOrGetChat(adminId);
                chatId = chatResponse.data._id;
                setCurrentChatId(chatId);
            }
            
            if (chatId) {
                const response = await sendMessage(chatId, messageToSend);
                // The backend now handles the response, so we just reload messages to get the latest state
                await loadMessages(chatId);
            } else {
                throw new Error("Could not establish a chat session.");
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                _id: (Date.now() + 1).toString(),
                content: "Sorry, your message could not be sent. Please try again.",
                sender: 'System',
                senderType: 'bot',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setSending(false);
            setIsTyping(false);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };
    
    // --- The rest of the component (renderMessage, renderTypingIndicator, JSX, and styles) remains the same ---
    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.senderType === 'user';
        
        return (
            <View style={[
                styles.messageContainer,
                isUser ? styles.userMessageContainer : styles.botMessageContainer
            ]}>
                {!isUser && (
                    <View style={styles.botAvatar}>
                        <SvgXml xml={botIcon} width={20} height={20} />
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isUser ? styles.userMessage : styles.botMessage
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.userMessageText : styles.botMessageText
                    ]}>
                        {item.content}
                    </Text>
                </View>
                {isUser && (
                    <View style={styles.userAvatar}>
                        <SvgXml xml={userIcon} width={16} height={16} />
                    </View>
                )}
            </View>
        );
    };

    const renderTypingIndicator = () => {
        if (!isTyping) return null;
        
        return (
            <View style={[styles.messageContainer, styles.botMessageContainer]}>
                <View style={styles.botAvatar}>
                    <SvgXml xml={botIcon} width={20} height={20} />
                </View>
                <View style={[styles.messageBubble, styles.botMessage]}>
                    <View style={styles.typingIndicator}>
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <AppHeader />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Connecting to Support...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />
            <View style={styles.header}>
                <View style={styles.headerAvatar}>
                    <SvgXml xml={botIcon} width={24} height={24} />
                </View>
                <View>
                    <Text style={styles.headerTitle}>Support Chat</Text>
                    <Text style={styles.headerStatus}>🟢 Online</Text>
                </View>
            </View>
            
            <KeyboardAvoidingView 
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.messagesContainer}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ListFooterComponent={renderTypingIndicator}
                />
                
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.textInput, { maxHeight: 100 }]}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type your message..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        editable={!sending && !!adminId}
                    />
                    <TouchableOpacity 
                        style={[
                            styles.sendButton,
                            (!inputText.trim() || sending) && styles.sendButtonDisabled
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || sending || !adminId}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <SvgXml xml={sendIcon} width={20} height={20} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChatbotScreen;
// Styles are unchanged
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F5FF',
    },
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    headerStatus: {
        fontSize: 14,
        color: '#10B981',
        marginTop: 2,
    },
    chatContainer: {
        flex: 1,
    },
    messagesContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    botMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '70%',
        padding: 12,
        borderRadius: 18,
    },
    userMessage: {
        backgroundColor: '#6366F1',
        borderBottomRightRadius: 4,
    },
    botMessage: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userMessageText: {
        color: '#FFFFFF',
    },
    botMessageText: {
        color: '#374151',
    },
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
        fontSize: 16,
        color: '#111827',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6B7280',
        marginHorizontal: 2,
    },
});