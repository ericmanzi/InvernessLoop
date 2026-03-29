// ─── Breathing Room Score Component ───────────────────────────────────────────
// Displays the 0–100 compatibility score with an animated arc/bar and label.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, breathingRoomColor } from '../utils/colors';
import { breathingRoomSummary } from '../utils/matchingAlgorithm';

interface BreathingRoomScoreProps {
  score: number;
  compact?: boolean;  // true = small inline version, false = full card
}

export function BreathingRoomScore({ score, compact = false }: BreathingRoomScoreProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const color = breathingRoomColor(score);
  const summary = breathingRoomSummary(score);

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: score,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [score, animatedWidth]);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={[styles.compactScore, { color }]}>{score}</Text>
        <Text style={styles.compactLabel}> BR</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Breathing Room Score</Text>
        <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <Text style={[styles.summary, { color }]}>{summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  summary: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  compactScore: {
    fontSize: 18,
    fontWeight: '700',
  },
  compactLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
