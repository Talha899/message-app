import axios, { AxiosInstance, CancelTokenSource } from 'axios';
import { Platform } from 'react-native';
import { ChatApiResponse, ChatApiError, ConversationContext } from '../types';

// API Base URL Configuration
// For mobile devices, use your computer's IP address
// For web, use localhost
// You can override this with EXPO_PUBLIC_API_URL in .env file

// Your computer's local IP address (found via: ipconfig on Windows, ifconfig on Mac/Linux)
const LOCAL_IP = '192.168.18.7';
const API_PORT = '3000';

const getApiBaseUrl = (): string => {
  // For mobile platforms (iOS/Android), always use IP address
  // Mobile devices cannot access localhost - they need the computer's IP
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    // If env URL is explicitly set and contains an IP (not localhost), use it
    if (envUrl && !envUrl.includes('localhost')) {
      return envUrl;
    }
    // Otherwise, use the IP address for mobile
    return `http://${LOCAL_IP}:${API_PORT}`;
  }
  
  // For web platform, check environment variable or use localhost
  if (Platform.OS === 'web') {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    return envUrl || `http://localhost:${API_PORT}`;
  }
  
  // Default fallback
  return `http://${LOCAL_IP}:${API_PORT}`;
};

const API_BASE_URL = getApiBaseUrl();

// Debug: Log the API URL being used (always log for debugging)
console.log(`🌐 API Base URL configured: ${API_BASE_URL}`);
console.log(`📱 Platform: ${Platform.OS}`);
console.log(`🔧 Environment URL: ${process.env.EXPO_PUBLIC_API_URL || 'not set'}`);

class ApiService {
  private client: AxiosInstance;
  private cancelTokenSource: CancelTokenSource | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async createSession(): Promise<{ sessionId: string }> {
    try {
      const response = await this.client.post<{ sessionId: string }>('/api/chat/session');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        throw new Error(
          `Cannot connect to backend at ${API_BASE_URL}. ` +
          'Please make sure the backend server is running on port 3000.'
        );
      }
      throw error;
    }
  }

  async sendMessage(
    sessionId: string,
    message: string,
    context: ConversationContext,
    onCancel?: () => void
  ): Promise<ChatApiResponse> {
    // Cancel previous request if exists
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel('New message sent');
      onCancel?.();
    }

    this.cancelTokenSource = axios.CancelToken.source();

    try {
      const response = await this.client.post<ChatApiResponse>(
        '/api/chat/message',
        {
          sessionId,
          message,
          context,
        },
        {
          cancelToken: this.cancelTokenSource.token,
        }
      );
      this.cancelTokenSource = null;
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Request cancelled');
      }
      
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ChatApiError;
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      throw new Error('Network error. Please check your connection.');
    }
  }

  cancelPendingRequest(): void {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel('User cancelled');
      this.cancelTokenSource = null;
    }
  }
}

export const apiService = new ApiService();

