import React, { useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { LatencyDisplay } from '../components/LatencyDisplay';
import { Message } from '../types';
import { Colors, Typography, Spacing } from '../constants/theme';

export const ChatScreen: React.FC = () => {
  const { session, sendMessage, retryLastMessage, hasError, isLoading } = useChat();
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (session.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [session.messages.length]);

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

  const data: (Message | { id: string; type: 'typing' })[] = [...session.messages];
  if (session.pending) {
    data.push({ id: 'typing', type: 'typing' });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support Assistant</Text>
        <LatencyDisplay latencyMs={session.lastLatencyMs} />
      </View>
      <FlatList
        ref={flatListRef}
        data={session.messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={session.pending ? <TypingIndicator /> : null}
        showsVerticalScrollIndicator={false}
      />
      <ChatInput
        onSendMessage={sendMessage}
        disabled={session.pending}
        pending={session.pending}
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
    backgroundColor: Colors.surface,
    paddingTop: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
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

