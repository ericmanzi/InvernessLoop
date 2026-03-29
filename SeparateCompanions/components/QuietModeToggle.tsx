// ─── Quiet Mode Toggle ────────────────────────────────────────────────────────
// A toggle that activates/deactivates the user's quiet (DND) mode manually.
// Automatic schedule-based activation is handled by useQuietMode().

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors } from '../utils/colors';
import { useAuthStore } from '../store/authStore';

interface QuietModeToggleProps {
  compact?: boolean;
}

export function QuietModeToggle({ compact = false }: QuietModeToggleProps) {
  const { currentUser, setQuietModeActive } = useAuthStore();
  const isActive = currentUser?.isCurrentlyInQuietMode ?? false;

  // Animated thumb position
  const thumbAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  const handleToggle = () => {
    const next = !isActive;
    Animated.spring(thumbAnim, {
      toValue: next ? 1 : 0,
      friction: 7,
      tension: 50,
      useNativeDriver: false,
    }).start();
    setQuietModeActive(next);
  };

  const thumbLeft = thumbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 24],
  });

  const trackColor = thumbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.blushDark],
  });

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handleToggle}
        style={styles.compactContainer}
        activeOpacity={0.8}
      >
        <Text style={styles.compactIcon}>{isActive ? '🌙' : '☀️'}</Text>
        <Text style={[styles.compactLabel, isActive && styles.compactLabelActive]}>
          {isActive ? 'Quiet' : 'Active'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelSection}>
        <Text style={styles.title}>Quiet Mode</Text>
        <Text style={styles.subtitle}>
          {isActive
            ? 'Messages are queued — you\'ll see them when you\'re back'
            : 'You\'re available — messages arrive as normal'}
        </Text>
      </View>
      <TouchableOpacity onPress={handleToggle} activeOpacity={0.85}>
        <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
          <Animated.View style={[styles.thumb, { left: thumbLeft }]} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 16,
  },
  labelSection: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  track: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.offwhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactIcon: {
    fontSize: 13,
  },
  compactLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  compactLabelActive: {
    color: Colors.blush,
  },
});
