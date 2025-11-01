import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Message } from '../types';
import { Colors, Typography, BorderRadius, Shadows, Spacing } from '../constants/theme';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const date = new Date(message.timestamp);
  const timeString = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Check if message has userName (group chat messages show sender name)
  const hasUserName = 'userName' in message && message.userName;
  // Show sender name for messages from others in group chat
  const showUserName = hasUserName && !isUser;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[
        styles.bubble, 
        isUser ? styles.userBubble : styles.assistantBubble,
        !isUser && Shadows.sm
      ]}>
        {showUserName && (
          <Text style={styles.userName}>{(message as any).userName}</Text>
        )}
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.text}
        </Text>
        {message.error && (
          <View style={[styles.errorContainer, isUser && styles.errorContainerUser]}>
            <Text style={styles.errorText}>⚠️ Failed to send</Text>
          </View>
        )}
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {timeString}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: Shadows.md,
    }),
  },
  userBubble: {
    backgroundColor: Colors.userBubble,
    borderBottomRightRadius: BorderRadius.sm,
    ...Platform.select({
      web: {
        background: `linear-gradient(135deg, ${Colors.userBubble} 0%, ${Colors.primaryDark} 100%)`,
      },
    }),
  },
  assistantBubble: {
    backgroundColor: Colors.assistantBubble,
    borderWidth: 1,
    borderColor: Colors.assistantBubbleBorder,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  text: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    fontWeight: Typography.fontWeight.regular,
  },
  userText: {
    color: Colors.textWhite,
  },
  assistantText: {
    color: Colors.textPrimary,
  },
  errorContainer: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  errorContainerUser: {
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    fontWeight: Typography.fontWeight.medium,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
    opacity: 0.75,
    fontWeight: Typography.fontWeight.regular,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: Colors.textSecondary,
    textAlign: 'left',
  },
  userName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
});

