/**
 * Modern color palette and theme constants
 */

import { Platform } from 'react-native';

export const Colors = {
  // Primary colors with gradients
  primary: '#007AFF',
  primaryDark: '#0051D5',
  primaryLight: '#5AC8FA',
  
  // Background colors
  background: '#F5F7FA',
  backgroundDark: '#0A0E27',
  surface: '#FFFFFF',
  surfaceLight: '#FAFBFC',
  
  // Message bubble colors
  userBubble: '#007AFF',
  userBubbleGradient: ['#007AFF', '#0051D5'],
  assistantBubble: '#FFFFFF',
  assistantBubbleBorder: '#E8ECEF',
  
  // Text colors
  textPrimary: '#1D1D1F',
  textSecondary: '#86868B',
  textTertiary: '#ABABAB',
  textWhite: '#FFFFFF',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',
  
  // Border and divider
  border: '#E8ECEF',
  divider: '#E5E5EA',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  
  // Input colors
  inputBackground: '#F8F9FA',
  inputBorder: '#E8ECEF',
  inputFocus: '#007AFF',
  
  // Typing indicator
  typingDot: '#999999',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Typography = {
  // Font sizes
  fontSize: {
    xs: 11,
    sm: 13,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Platform-specific shadow
export const getShadow = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const shadow = Shadows[size];
  return {
    ...shadow,
    ...(Platform.OS === 'web' && {
      boxShadow: `${shadow.shadowOffset.width}px ${shadow.shadowOffset.height}px ${shadow.shadowRadius}px ${shadow.shadowColor}`,
    }),
  };
};

