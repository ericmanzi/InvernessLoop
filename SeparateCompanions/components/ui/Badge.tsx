import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, attachmentStyleColor } from '../../utils/colors';
import type { AttachmentStyle } from '../../types';

type BadgeVariant = 'attachment' | 'quiet' | 'slowlane' | 'confirmed' | 'pending' | 'custom';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  attachmentStyle?: AttachmentStyle;
  color?: string;
  small?: boolean;
}

export function Badge({
  label,
  variant = 'custom',
  attachmentStyle,
  color,
  small = false,
}: BadgeProps) {
  const bg = color ?? resolveBackground(variant, attachmentStyle);
  const textColor = resolveTextColor(variant, attachmentStyle);

  return (
    <View style={[styles.badge, small && styles.small, { backgroundColor: bg }]}>
      <Text style={[styles.text, small && styles.smallText, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
}

function resolveBackground(variant: BadgeVariant, attachmentStyle?: AttachmentStyle): string {
  switch (variant) {
    case 'attachment':
      return attachmentStyle
        ? `${attachmentStyleColor(attachmentStyle)}22` // 13% opacity tint
        : Colors.navyLight;
    case 'quiet':      return `${Colors.blush}22`;
    case 'slowlane':   return `${Colors.sand}22`;
    case 'confirmed':  return `${Colors.sage}22`;
    case 'pending':    return `${Colors.sandDark}22`;
    default:           return Colors.navyLight;
  }
}

function resolveTextColor(variant: BadgeVariant, attachmentStyle?: AttachmentStyle): string {
  switch (variant) {
    case 'attachment':
      return attachmentStyle ? attachmentStyleColor(attachmentStyle) : Colors.textSecondary;
    case 'quiet':     return Colors.blush;
    case 'slowlane':  return Colors.sand;
    case 'confirmed': return Colors.sage;
    case 'pending':   return Colors.sandDark;
    default:          return Colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  small: {
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  smallText: {
    fontSize: 10,
  },
});
