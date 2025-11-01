import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginCredentials, SignupData, AuthUser } from '../types/auth';

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
    return envUrl || `http://localhost:${API_PORT}`;
  }
  
  return `http://${LOCAL_IP}:${API_PORT}`;
};

const API_BASE_URL = getApiBaseUrl();

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/api/auth/login', credentials);
    
    // Store token and user
    await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    
    return response.data;
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/api/auth/signup', data);
    
    // Store token and user
    await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  async getStoredUser(): Promise<AuthUser | null> {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  async checkAuth(): Promise<{ user: AuthUser; token: string } | null> {
    const token = await this.getStoredToken();
    const user = await this.getStoredUser();
    
    if (token && user) {
      return { user, token };
    }
    
    return null;
  },

  setAuthHeader(token: string): void {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  clearAuthHeader(): void {
    delete client.defaults.headers.common['Authorization'];
  },
};

