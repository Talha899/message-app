/**
 * UUID v4 generator for React Native/Expo
 * Compatible with web and mobile platforms
 * Generates RFC4122 version 4 UUIDs
 */

export function generateUUID(): string {
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Where:
  // - x is any hexadecimal digit
  // - The 13th character is always '4' (version 4)
  // - The 17th character is one of 8, 9, A, or B (variant)
  
  const chars = '0123456789abcdef';
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  
  return template.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    // For 'x', use random hex digit (0-15)
    // For 'y', use random value from 8, 9, A, B (1000, 1001, 1010, 1011 in binary)
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return chars[v];
  });
}

// Alias for compatibility with uuid package
export const v4 = generateUUID;

