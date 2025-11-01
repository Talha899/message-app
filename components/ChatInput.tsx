import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors, Typography, BorderRadius, Shadows, Spacing } from '../constants/theme';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  pending?: boolean;
  onRetry?: () => void;
  hasError?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  pending = false,
  hasError = false,
  onRetry,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && !pending) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  const canSend = message.trim().length > 0 && !disabled && !pending;

  return (
    <View style={styles.container}>
      {hasError && onRetry && (
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.retryIcon}>🔄</Text>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={500}
            editable={!disabled && !pending}
            onSubmitEditing={handleSend}
            accessibilityLabel="Message input"
            accessibilityHint="Enter your message to chat with the assistant"
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
          accessibilityLabel="Send message"
          accessibilityRole="button"
        >
          {pending ? (
            <ActivityIndicator size="small" color={Colors.textWhite} />
          ) : (
            <Text style={styles.sendButtonText}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    paddingTop: Spacing.xs,
    ...Platform.select({
      web: {
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
      },
      default: {
        ...Shadows.sm,
        shadowOffset: { width: 0, height: -2 },
      },
    }),
  },
  retryButton: {
    backgroundColor: Colors.error,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  retryIcon: {
    fontSize: 16,
  },
  retryText: {
    color: Colors.textWhite,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
      default: Shadows.sm,
    }),
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: Typography.fontSize.base,
    maxHeight: 120,
    backgroundColor: Colors.inputBackground,
    color: Colors.textPrimary,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
    ...Platform.select({
      web: {
        background: `linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.primaryDark} 100%)`,
      },
    }),
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.5,
  },
  sendButtonText: {
    color: Colors.textWhite,
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: 2,
  },
});

