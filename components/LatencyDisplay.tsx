import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../constants/theme';

interface LatencyDisplayProps {
  latencyMs: number;
}

export const LatencyDisplay: React.FC<LatencyDisplayProps> = ({ latencyMs }) => {
  if (latencyMs === 0) return null;

  const getLatencyColor = (ms: number): string => {
    if (ms < 1000) return Colors.success;
    if (ms < 2000) return Colors.warning;
    return Colors.error;
  };

  const getLatencyStatus = (ms: number): string => {
    if (ms < 1000) return '⚡';
    if (ms < 2000) return '✓';
    return '⚠';
  };

  const latencyColor = getLatencyColor(latencyMs);
  const statusIcon = getLatencyStatus(latencyMs);

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: latencyColor + '15' }]}>
        <Text style={styles.icon}>{statusIcon}</Text>
        <Text style={[styles.text, { color: latencyColor }]}>
          {latencyMs}ms
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs / 2,
  },
  icon: {
    fontSize: Typography.fontSize.xs,
  },
  text: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
});

