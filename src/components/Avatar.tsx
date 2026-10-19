import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { avatarPalette, colors } from '../theme/colors';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', showBorder = false }) => {
  // Deterministic color selection based on name
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % avatarPalette.length;
  const color = avatarPalette[colorIndex];

  // Extract initials (up to 2 letters)
  const cleanName = (name || '?').trim();
  const parts = cleanName.split(' ').filter(Boolean);
  const initials =
    parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : cleanName.slice(0, 2).toUpperCase();

  const sizeStyle = {
    sm: { container: 26, font: 11, radius: 13 },
    md: { container: 36, font: 13, radius: 18 },
    lg: { container: 46, font: 16, radius: 23 },
    xl: { container: 58, font: 20, radius: 29 },
  }[size];

  return (
    <View
      style={[
        styles.avatar,
        {
          width: sizeStyle.container,
          height: sizeStyle.container,
          borderRadius: sizeStyle.radius,
          backgroundColor: color.bg,
        },
        showBorder && styles.border,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeStyle.font,
            color: color.text,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  border: {
    borderWidth: 2,
    borderColor: colors.card,
  },
});
