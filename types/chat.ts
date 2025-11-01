export type ChatType = 'direct' | 'channel';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: number;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  memberCount: number;
  unreadCount?: number;
}

export interface ChatRoom {
  id: string;
  type: ChatType;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  isOnline?: boolean;
  // For direct messages
  userId?: string;
  // For channels
  channelId?: string;
  description?: string;
}

