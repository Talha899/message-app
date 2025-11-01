import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ChatScreen } from './screens/ChatScreen';
import { HomeScreen } from './screens/HomeScreen';
import { UsersListScreen } from './screens/UsersListScreen';
import { TicketsScreen } from './screens/TicketsScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { ChatRoom, User } from './types/chat';
import { useAuth } from './hooks/useAuth';
import { Colors } from './constants/theme';

type Screen = 'home' | 'chat' | 'users' | 'tickets';
type AuthScreen = 'login' | 'signup';

export default function App() {
  const { user, isAuthenticated, isLoading, error, login, signup, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);

  const handleSelectChat = (chat: ChatRoom) => {
    // If user selected #tickets channel, show tickets screen
    if (chat.channelId === 'tickets') {
      setCurrentScreen('tickets');
      return;
    }
    
    setSelectedChat(chat);
    setCurrentScreen('chat');
  };

  const handleSelectUser = (user: User) => {
    const chatRoom: ChatRoom = {
      id: `dm-${user.id}`,
      type: 'direct',
      name: user.name,
      avatar: getAvatarEmoji(user.name),
      unreadCount: 0,
      userId: user.id,
      isOnline: user.status === 'online',
    };
    setSelectedChat(chatRoom);
    setCurrentScreen('chat');
  };

  const handleBack = () => {
    setCurrentScreen('home');
    setSelectedChat(null);
  };

  const getAvatarEmoji = (name: string): string => {
    const emojis = ['👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻'];
    const index = name.length % emojis.length;
    return emojis[index];
  };

  // Auth loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Not authenticated - show login/signup
  if (!isAuthenticated) {
    if (authScreen === 'signup') {
      return (
        <SignupScreen
          onSignup={async (name, email, password) => {
            try {
              await signup(name, email, password);
            } catch (err) {
              // Error handled in useAuth
            }
          }}
          onSwitchToLogin={() => setAuthScreen('login')}
          loading={isLoading}
          error={error || undefined}
        />
      );
    }

    return (
      <LoginScreen
        onLogin={async (email, password) => {
          try {
            await login(email, password);
          } catch (err) {
            // Error handled in useAuth
          }
        }}
        onSwitchToSignup={() => setAuthScreen('signup')}
        loading={isLoading}
        error={error || undefined}
      />
    );
  }

  // Authenticated - render main app screens
  if (currentScreen === 'users') {
    return <UsersListScreen onSelectUser={handleSelectUser} onBack={handleBack} />;
  }

  if (currentScreen === 'tickets') {
    return <TicketsScreen onBack={handleBack} />;
  }

  if (currentScreen === 'chat') {
    return <ChatScreen chatRoom={selectedChat || undefined} onBack={handleBack} />;
  }

  return (
    <HomeScreen 
      onSelectChat={handleSelectChat} 
      onLogout={logout}
      userName={user?.name}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
