// ─── Profile Card ─────────────────────────────────────────────────────────────
// Swipeable/dismissable card shown in the discover stack.
// Uses Reanimated for gesture-driven pan + tilt effect.

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, breathingRoomColor } from '../utils/colors';
import { Badge } from './ui/Badge';
import { attachmentStyleLabel } from '../utils/attachmentQuiz';
import type { UserProfile } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const SWIPE_THRESHOLD = CARD_WIDTH * 0.35;

interface ProfileCardProps {
  profile: UserProfile;
  breathingRoomScore: number;
  onSwipe: (direction: 'like' | 'pass') => void;
  isTop: boolean;
}

export function ProfileCard({ profile, breathingRoomScore, onSwipe, isTop }: ProfileCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const triggerSwipe = useCallback(
    (direction: 'like' | 'pass') => {
      onSwipe(direction);
    },
    [onSwipe]
  );

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const direction = e.translationX > 0 ? 'like' : 'pass';
        // Fly off screen
        translateX.value = withTiming(
          e.translationX > 0 ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
          { duration: 280 }
        );
        opacity.value = withTiming(0, { duration: 260 }, () => {
          runOnJS(triggerSwipe)(direction);
        });
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-18, 0, 18],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
      opacity: opacity.value,
    };
  });

  // Action label overlays that fade in as you swipe
  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));
  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const brColor = breathingRoomColor(breathingRoomScore);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Photo */}
        <Image
          source={{ uri: profile.photoUri ?? 'https://i.pravatar.cc/400' }}
          style={styles.photo}
          resizeMode="cover"
        />

        {/* Gradient overlay at bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(13,27,42,0.97)']}
          style={styles.gradient}
        />

        {/* Swipe action overlays */}
        <Animated.View style={[styles.actionOverlay, styles.likeOverlay, likeOverlayStyle]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.actionOverlay, styles.passOverlay, passOverlayStyle]}>
          <Text style={styles.passText}>PASS</Text>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}, {profile.age}</Text>
            {profile.isCurrentlyInQuietMode && (
              <Badge label="Quiet Mode" variant="quiet" small />
            )}
          </View>

          <Badge
            label={attachmentStyleLabel(profile.attachmentStyle)}
            variant="attachment"
            attachmentStyle={profile.attachmentStyle}
            small
          />

          <Text style={styles.bio} numberOfLines={3}>
            {profile.bio}
          </Text>

          {/* Breathing Room score */}
          <View style={styles.brRow}>
            <View style={styles.brBadge}>
              <Text style={[styles.brScore, { color: brColor }]}>{breathingRoomScore}</Text>
              <Text style={styles.brLabel}>Breathing Room</Text>
            </View>
            {/* Mini preference pills */}
            <View style={styles.prefPills}>
              <PrefPill icon="💬" value={formatTexting(profile.spacePreferences.textingFrequency)} />
              <PrefPill icon="🤝" value={formatInPerson(profile.spacePreferences.inPersonFrequency)} />
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Action buttons used below the card stack ─────────────────────────────────

interface CardActionsProps {
  onLike: () => void;
  onPass: () => void;
}

export function CardActions({ onLike, onPass }: CardActionsProps) {
  return (
    <View style={actionStyles.container}>
      <TouchableOpacity style={[actionStyles.btn, actionStyles.pass]} onPress={onPass} activeOpacity={0.8}>
        <Text style={actionStyles.passIcon}>✕</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[actionStyles.btn, actionStyles.like]} onPress={onLike} activeOpacity={0.8}>
        <Text style={actionStyles.likeIcon}>♡</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PrefPill({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={pillStyles.pill}>
      <Text style={pillStyles.icon}>{icon}</Text>
      <Text style={pillStyles.text}>{value}</Text>
    </View>
  );
}

function formatTexting(freq: string): string {
  switch (freq) {
    case 'once-a-day': return 'Daily texts';
    case 'few-times-a-week': return '~3x/week';
    case 'when-inspired': return 'When inspired';
    default: return freq;
  }
}

function formatInPerson(freq: string): string {
  switch (freq) {
    case 'daily': return 'Daily meetups';
    case 'few-times-a-week': return '~3x/week';
    case 'weekends': return 'Weekends';
    case 'few-times-a-month': return 'Monthly';
    default: return freq;
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.35,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.navyLight,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.offwhite,
  },
  bio: {
    fontSize: 13,
    color: `${Colors.offwhiteWarm}CC`,
    lineHeight: 18,
    marginTop: 2,
  },
  brRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  brBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  brScore: {
    fontSize: 22,
    fontWeight: '800',
  },
  brLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  prefPills: {
    flexDirection: 'row',
    gap: 6,
  },

  // Swipe overlays
  actionOverlay: {
    position: 'absolute',
    top: 32,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2.5,
    zIndex: 10,
  },
  likeOverlay: {
    left: 24,
    borderColor: Colors.sage,
    transform: [{ rotate: '-15deg' }],
  },
  passOverlay: {
    right: 24,
    borderColor: Colors.blush,
    transform: [{ rotate: '15deg' }],
  },
  likeText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.sage,
    letterSpacing: 2,
  },
  passText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.blush,
    letterSpacing: 2,
  },
});

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(13,27,42,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: { fontSize: 10 },
  text: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },
});

const actionStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingVertical: 20,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  pass: {
    backgroundColor: Colors.navyLight,
    borderWidth: 1.5,
    borderColor: Colors.blush,
  },
  like: {
    backgroundColor: Colors.navyLight,
    borderWidth: 1.5,
    borderColor: Colors.sage,
  },
  passIcon: {
    fontSize: 24,
    color: Colors.blush,
    fontWeight: '600',
  },
  likeIcon: {
    fontSize: 26,
    color: Colors.sage,
  },
});
