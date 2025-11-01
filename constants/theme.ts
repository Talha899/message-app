/**
 * Modern color palette and theme constants
 */

import { Platform } from 'react-native';

export const Colors = {
  // Primary colors - Modern indigo gradient
  primary: '#6366F1', // Indigo-500
  primaryDark: '#4F46E5', // Indigo-600
  primaryLight: '#818CF8', // Indigo-400
  primaryGradient: ['#6366F1', '#4F46E5'],
  
  // Background colors - Soft, professional
  background: '#F8FAFC', // Slate-50
  backgroundSecondary: '#F1F5F9', // Slate-100
  backgroundDark: '#0F172A', // Slate-900
  surface: '#FFFFFF',
  surfaceLight: '#FAFBFC',
  surfaceElevated: '#FFFFFF',
  
  // Message bubble colors - Premium feel
  userBubble: '#6366F1', // Indigo
  userBubbleGradient: ['#6366F1', '#4F46E5'],
  assistantBubble: '#FFFFFF',
  assistantBubbleBorder: '#E2E8F0', // Slate-200
  assistantBubbleShadow: 'rgba(15, 23, 42, 0.08)',
  
  // Text colors - High contrast, readable
  textPrimary: '#0F172A', // Slate-900
  textSecondary: '#64748B', // Slate-500
  textTertiary: '#94A3B8', // Slate-400
  textWhite: '#FFFFFF',
  textInverse: '#FFFFFF',
  
  // Status colors - Modern, accessible
  success: '#10B981', // Emerald-500
  warning: '#F59E0B', // Amber-500
  error: '#EF4444', // Red-500
  info: '#3B82F6', // Blue-500
  
  // Border and divider - Subtle
  border: '#E2E8F0', // Slate-200
  divider: '#E2E8F0',
  borderLight: '#F1F5F9', // Slate-100
  
  // Shadow colors - Layered depth
  shadow: 'rgba(15, 23, 42, 0.1)',
  shadowLight: 'rgba(15, 23, 42, 0.05)',
  shadowMedium: 'rgba(15, 23, 42, 0.12)',
  shadowStrong: 'rgba(15, 23, 42, 0.2)',
  
  // Input colors - Clean, modern
  inputBackground: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputFocus: '#6366F1',
  inputPlaceholder: '#94A3B8',
  
  // Typing indicator
  typingDot: '#94A3B8',
  
  // Header colors
  headerBackground: '#FFFFFF',
  headerText: '#0F172A',
  headerBorder: '#E2E8F0',
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

