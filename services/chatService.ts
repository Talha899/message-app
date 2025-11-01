import axios from 'axios';
import { Platform } from 'react-native';
import { User, Channel } from '../types/chat';

const LOCAL_IP = '192.168.18.7';
const API_PORT = '3000';

const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    if (envUrl && !envUrl.includes('localhost')) {
      return envUrl;
    }
    return `http://${LOCAL_IP}:${API_PORT}`;
  }
  
  if (Platform.OS === 'web') {
    const env = process.env.EXPO_PUBLIC_API_URL;
    return envUrl || `http://localhost:${API_PORT}`;
  }
  
  return `http://${LOCAL_IP}:${API_PORT}`;
};

const API_BASE_URL = getApiBaseUrl();

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatService = {
  async getUsers(): Promise<User[]> {
    try {
      const response = await client.get<{ users: User[] }>('/api/users');
      return response.data.users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  },

  async getChannels(): Promise<Channel[]> {
    try {
      const response = await client.get<{ channels: Channel[] }>('/api/channels');
      return response.data.channels;
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      return [];
    }
  },

  async getUser(userId: string): Promise<User | null> {
    try {
      const response = await client.get<User>(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  },

  async getChannel(channelId: string): Promise<Channel | null> {
    try {
      const response = await client.get<Channel>(`/api/channels/${channelId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch channel:', error);
      return null;
    }
  },
};

