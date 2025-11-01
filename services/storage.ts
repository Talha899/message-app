import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatSession } from '../types';

const STORAGE_KEY = '@chat_session';

export const storageService = {
  async saveSession(session: ChatSession): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  async loadSession(): Promise<ChatSession | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  },

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },
};

