import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../constants/theme';
import axios from 'axios';

interface Ticket {
  ticketId: string;
  product: string;
  issue: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: number;
}

interface TicketsScreenProps {
  onBack: () => void;
}

// Mock tickets data
const MOCK_TICKETS: Ticket[] = [
  {
    ticketId: 'T-3847',
    product: 'Mobile App',
    issue: 'Crashes during photo uploads',
    urgency: 'high',
    status: 'open',
    createdAt: Date.now() - 3600000,
  },
  {
    ticketId: 'T-3846',
    product: 'Web Dashboard',
    issue: 'Login timeout issue',
    urgency: 'medium',
    status: 'in_progress',
    createdAt: Date.now() - 7200000,
  },
  {
    ticketId: 'T-3845',
    product: 'API',
    issue: 'Slow response times',
    urgency: 'high',
    status: 'open',
    createdAt: Date.now() - 10800000,
  },
  {
    ticketId: 'T-3844',
    product: 'Desktop App',
    issue: 'Settings not saving',
    urgency: 'low',
    status: 'resolved',
    createdAt: Date.now() - 86400000,
  },
];

const getApiBaseUrl = (): string => {
  const LOCAL_IP = '192.168.18.7';
  const API_PORT = '3000';
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    if (envUrl && !envUrl.includes('localhost')) {
      return envUrl;
    }
    return `http://${LOCAL_IP}:${API_PORT}`;
  }
  
  return envUrl || `http://localhost:${API_PORT}`;
};

export const TicketsScreen: React.FC<TicketsScreenProps> = ({ onBack }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = getApiBaseUrl();
      console.log('Fetching tickets from:', `${apiUrl}/api/tickets`);
      
      const response = await axios.get<{ tickets: Ticket[] }>(`${apiUrl}/api/tickets`, {
        timeout: 10000,
      });
      
      console.log('Tickets response:', response.data);
      
      // If no tickets in database, show mock data for demo
      if (response.data.tickets.length === 0) {
        console.log('No tickets in database, using mock data');
        setTickets(MOCK_TICKETS);
      } else {
        setTickets(response.data.tickets);
      }
    } catch (err: any) {
      console.error('Failed to load tickets:', err);
      setError(err.message);
      // Fallback to mock data if API fails
      setTickets(MOCK_TICKETS);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'high':
        return Colors.error;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.info;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open':
        return Colors.error;
      case 'in_progress':
        return Colors.warning;
      case 'resolved':
        return Colors.success;
      case 'closed':
        return Colors.textTertiary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketId}>{item.ticketId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.ticketProduct}>{item.product}</Text>
      <Text style={styles.ticketIssue} numberOfLines={2}>{item.issue}</Text>
      
      <View style={styles.ticketFooter}>
        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) + '15' }]}>
          <Text style={[styles.urgencyText, { color: getUrgencyColor(item.urgency) }]}>
            {item.urgency.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading tickets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Support Tickets</Text>
          <Text style={styles.headerSubtitle}>{tickets.length} total tickets</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎫</Text>
          <Text style={styles.emptyText}>No tickets yet</Text>
          <Text style={styles.emptySubtext}>Create a ticket in #support</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item.ticketId}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginLeft: -2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
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
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  ticketCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ticketId: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.3,
  },
  ticketProduct: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs / 2,
  },
  ticketIssue: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.base * 1.5,
    marginBottom: Spacing.md,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgencyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  urgencyText: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.medium,
  },
});

