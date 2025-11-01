import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../constants/theme';
import { ChatRoom, User } from '../types/chat';
import { chatService } from '../services/chatService';

interface HomeScreenProps {
  onSelectChat: (chat: ChatRoom) => void;
  onLogout?: () => void;
  userName?: string;
}

// Channel data - 3 main channels
const CHANNELS: ChatRoom[] = [
  {
    id: 'support',
    type: 'channel',
    name: '#support',
    description: 'AI assistant for creating support tickets',
    lastMessage: 'Hi! I\'m your support assistant...',
    lastMessageTime: Date.now() - 60000,
    unreadCount: 0,
    channelId: 'support',
  },
  {
    id: 'tickets',
    type: 'channel',
    name: '#tickets',
    description: 'View all submitted support tickets',
    lastMessage: 'Ticket #T-3847 submitted',
    lastMessageTime: Date.now() - 1800000,
    unreadCount: 3,
    channelId: 'tickets',
  },
  {
    id: 'group-chat',
    type: 'channel',
    name: '#group-chat',
    description: 'General group chat with all users',
    lastMessage: 'Welcome everyone!',
    lastMessageTime: Date.now() - 3600000,
    unreadCount: 0,
    channelId: 'group-chat',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectChat, onLogout, userName }) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'messages'>('channels');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users when switching to Direct Messages tab
  useEffect(() => {
    if (activeTab === 'messages') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      console.log('HomeScreen: Fetching users from API...');
      const fetchedUsers = await chatService.getUsers();
      console.log('HomeScreen: Fetched users:', fetchedUsers.length, 'users');
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('HomeScreen: Failed to load users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const getAvatarEmoji = (name: string): string => {
    const emojis = ['👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻'];
    const index = name.length % emojis.length;
    return emojis[index];
  };

  // Convert users to ChatRoom format for direct messages
  const directMessages: ChatRoom[] = users.map(user => ({
    id: `dm-${user.id}`,
    type: 'direct' as const,
    name: user.name,
    avatar: getAvatarEmoji(user.name),
    lastMessage: undefined,
    lastMessageTime: undefined,
    unreadCount: 0,
    userId: user.id,
    isOnline: user.status === 'online',
  }));

  const data = activeTab === 'channels' ? CHANNELS : directMessages;

  const formatTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const renderChatItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => onSelectChat(item)}
      activeOpacity={0.7}
    >
      <View style={styles.chatItemLeft}>
        {item.type === 'channel' ? (
          <View style={styles.channelIcon}>
            <Text style={styles.channelIconText}>#</Text>
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{item.avatar || '👤'}</Text>
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>
        )}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.lastMessageTime && (
              <Text style={styles.timeText}>{formatTime(item.lastMessageTime)}</Text>
            )}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || item.description || 'No messages yet'}
          </Text>
        </View>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Messages</Text>
          {userName && (
            <Text style={styles.headerSubtitle}>Hi, {userName.split(' ')[0]}!</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.newChatButton}>
            <Text style={styles.newChatButtonText}>✎</Text>
          </TouchableOpacity>
          {onLogout && (
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>⏻</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'channels' && styles.tabActive]}
          onPress={() => setActiveTab('channels')}
        >
          <Text style={[styles.tabText, activeTab === 'channels' && styles.tabTextActive]}>
            Channels
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
          onPress={() => setActiveTab('messages')}
        >
          <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
            Direct Messages
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      {activeTab === 'messages' && loadingUsers ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            {activeTab === 'channels' ? '💬' : '👥'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'channels' ? 'No channels available' : 'No users found'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  newChatButtonText: {
    fontSize: 20,
    color: Colors.textWhite,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  listContainer: {
    paddingVertical: Spacing.xs,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  chatItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  channelIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  channelIconText: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    fontSize: 44,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  timeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.medium,
  },
  lastMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * 1.4,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  unreadText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
});

