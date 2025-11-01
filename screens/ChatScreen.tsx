import React, { useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useChat } from '../hooks/useChat';
import { useDirectChat } from '../hooks/useDirectChat';
import { useGroupChat } from '../hooks/useGroupChat';
import { useAuth } from '../hooks/useAuth';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { LatencyDisplay } from '../components/LatencyDisplay';
import { Message } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { ChatRoom } from '../types/chat';

interface ChatScreenProps {
  chatRoom?: ChatRoom;
  onBack?: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ chatRoom, onBack }) => {
  const { user } = useAuth();
  
  // Determine chat type
  const isAIChat = !chatRoom || chatRoom.channelId === 'support';
  const isGroupChat = chatRoom?.type === 'channel' && chatRoom?.channelId === 'group-chat';
  
  // Use AI chat hook for support channel
  const aiChat = useChat();
  
  // Use group chat hook for group channels
  const groupChat = useGroupChat(
    chatRoom?.channelId || 'group-chat',
    user?.id || '',
    user?.name || 'Anonymous'
  );
  
  // Use direct chat hook for user-to-user messaging
  const directChat = useDirectChat(
    chatRoom?.id || 'default',
    chatRoom?.userId,
    user?.id,
    user?.name
  );
  
  // Select the appropriate chat system
  const { 
    messages, 
    sendMessage, 
    retryLastMessage, 
    pending, 
    isLoading 
  } = isAIChat 
    ? {
        messages: aiChat.session.messages,
        sendMessage: aiChat.sendMessage,
        retryLastMessage: aiChat.retryLastMessage,
        pending: aiChat.session.pending,
        isLoading: aiChat.isLoading,
      }
    : isGroupChat
    ? {
        messages: groupChat.messages,
        sendMessage: groupChat.sendMessage,
        retryLastMessage: groupChat.retryLastMessage,
        pending: groupChat.pending,
        isLoading: groupChat.isLoading,
      }
    : {
        messages: directChat.messages,
        sendMessage: directChat.sendMessage,
        retryLastMessage: directChat.retryLastMessage,
        pending: directChat.pending,
        isLoading: directChat.isLoading,
      };
  
  const hasError = isAIChat ? aiChat.hasError : false;
  const latencyMs = isAIChat ? aiChat.session.lastLatencyMs : 0;
  
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      </View>
    );
  }

  // Only show typing indicator for AI chat
  const showTypingIndicator = isAIChat && pending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="auto" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>
              {chatRoom?.type === 'channel' ? '💬' : chatRoom?.avatar || '💬'}
            </Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {chatRoom?.name || 'Support Assistant'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {chatRoom?.type === 'direct' 
                ? (chatRoom?.isOnline ? '● Online' : '○ Offline')
                : chatRoom?.type === 'channel' && chatRoom?.channelId === 'group-chat'
                  ? 'Group conversation'
                  : chatRoom?.description || 'We\'re here to help'}
            </Text>
          </View>
        </View>
        {isAIChat && <LatencyDisplay latencyMs={latencyMs} />}
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={showTypingIndicator ? <TypingIndicator /> : null}
        showsVerticalScrollIndicator={false}
      />
      <ChatInput
        onSendMessage={sendMessage}
        disabled={pending}
        pending={pending}
        hasError={hasError}
        onRetry={retryLastMessage}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.headerBackground,
    paddingTop: Platform.OS === 'ios' ? Spacing.lg + Spacing.xs : Spacing.md + Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.headerBorder,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
      },
      default: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginLeft: -2,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg + 2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.headerText,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.regular,
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingContent: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  messagesContainer: {
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
});

