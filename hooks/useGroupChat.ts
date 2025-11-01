import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Platform } from 'react-native';
import { Message } from '../types';
import { v4 as uuidv4 } from '../utils/uuid';

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
  return envUrl || `http://localhost:${API_PORT}`;
};

interface GroupMessage extends Message {
  userName?: string;
  userId?: string;
}

/**
 * Hook for group chat messaging (multi-user conversations)
 */
export const useGroupChat = (channelId: string, currentUserId: string, currentUserName: string) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load messages when channel changes
  useEffect(() => {
    loadMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      loadMessages(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [channelId]);

  const loadMessages = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      const apiUrl = getApiBaseUrl();
      const response = await axios.get(`${apiUrl}/api/group-chat/messages/${channelId}`);
      
      if (response.data.messages) {
        // Add role based on whether message is from current user
        const messagesWithRole = response.data.messages.map((msg: any) => ({
          ...msg,
          role: msg.userId === currentUserId ? 'user' : 'assistant',
        }));
        setMessages(messagesWithRole);
      }
    } catch (error) {
      console.error('Failed to load group messages:', error);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || pending) return;

    const userMessage: GroupMessage = {
      id: uuidv4(),
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
      userName: currentUserName,
      userId: currentUserId,
    };

    // Add message optimistically
    setMessages((prev) => [...prev, userMessage]);
    setPending(true);

    try {
      const apiUrl = getApiBaseUrl();
      await axios.post(`${apiUrl}/api/group-chat/messages`, {
        channelId,
        userId: currentUserId,
        userName: currentUserName,
        message: text.trim(),
      });

      // Reload to get server's version
      await loadMessages(true);
    } catch (error) {
      console.error('Failed to send group message:', error);
      
      // Mark message as failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, error: true } : msg
        )
      );
    } finally {
      setPending(false);
    }
  }, [channelId, currentUserId, currentUserName, pending]);

  const retryLastMessage = useCallback(() => {
    const lastFailedMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'user' && msg.error);
    
    if (lastFailedMessage) {
      sendMessage(lastFailedMessage.text);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    sendMessage,
    retryLastMessage,
    pending,
    isLoading,
  };
};

