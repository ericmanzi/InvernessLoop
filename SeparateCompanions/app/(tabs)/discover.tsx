// ─── Discover screen ──────────────────────────────────────────────────────────
// Shows a swipeable card stack of potential matches.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, breathingRoomColor } from '../../utils/colors';
import { useMatchStore } from '../../store/matchStore';
import { useAuthStore } from '../../store/authStore';
import { ProfileCard, CardActions } from '../../components/ProfileCard';
import { profileBreathingRoom } from '../../utils/matchingAlgorithm';

export default function DiscoverScreen() {
  const { discoverStack, swipe, matches } = useMatchStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [matchModal, setMatchModal] = useState<{ name: string; score: number } | null>(null);

  // Default prefs if user hasn't set up profile yet
  const userPrefs = currentUser?.spacePreferences ?? {
    textingFrequency: 'few-times-a-week' as const,
    responseTimeExpectation: 'within-a-day' as const,
    inPersonFrequency: 'few-times-a-week' as const,
    personalSpaceNeed: 'some-needed' as const,
  };

  const topProfile = discoverStack[0];
  const secondProfile = discoverStack[1];

  function handleSwipe(direction: 'like' | 'pass') {
    if (!topProfile) return;

    const prevMatchCount = matches.length;
    swipe(topProfile.id, direction, userPrefs);

    // Check if a new match was created (like direction only)
    if (direction === 'like') {
      setTimeout(() => {
        const newMatchCount = useMatchStore.getState().matches.length;
        if (newMatchCount > prevMatchCount) {
          const score = currentUser
            ? profileBreathingRoom(currentUser, topProfile).overall
            : 70;
          setMatchModal({ name: topProfile.name, score });
        }
      }, 300);
    }
  }

  function getBreathingRoomForProfile(profileId: string): number {
    if (!currentUser) return 75;
    const profile = discoverStack.find((p) => p.id === profileId);
    if (!profile) return 75;
    return profileBreathingRoom(currentUser, profile).overall;
  }

  return (
    <LinearGradient colors={[Colors.navyDark, Colors.navy]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>Separate Companions</Text>
            <Text style={styles.stackCount}>
              {discoverStack.length} {discoverStack.length === 1 ? 'profile' : 'profiles'} nearby
            </Text>
          </View>

          {/* Card stack */}
          <View style={styles.cardStack}>
            {discoverStack.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Background card (second in stack) */}
                {secondProfile && (
                  <View style={styles.secondCard}>
                    <View style={styles.secondCardInner} />
                  </View>
                )}

                {/* Top card */}
                <ProfileCard
                  key={topProfile.id}
                  profile={topProfile}
                  breathingRoomScore={getBreathingRoomForProfile(topProfile.id)}
                  onSwipe={handleSwipe}
                  isTop
                />
              </>
            )}
          </View>

          {/* Action buttons */}
          {discoverStack.length > 0 && (
            <CardActions
              onLike={() => handleSwipe('like')}
              onPass={() => handleSwipe('pass')}
            />
          )}
        </View>
      </SafeAreaView>

      {/* Match modal */}
      {matchModal && (
        <MatchModal
          name={matchModal.name}
          score={matchModal.score}
          onDismiss={() => setMatchModal(null)}
        />
      )}
    </LinearGradient>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.icon}>🌿</Text>
      <Text style={emptyStyles.title}>You've seen everyone</Text>
      <Text style={emptyStyles.subtitle}>
        New profiles appear as the community grows. Enjoy the quiet.
      </Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  icon: { fontSize: 48 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.offwhite,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

// ─── Match modal ───────────────────────────────────────────────────────────────

interface MatchModalProps {
  name: string;
  score: number;
  onDismiss: () => void;
}

function MatchModal({ name, score, onDismiss }: MatchModalProps) {
  const color = breathingRoomColor(score);
  return (
    <Modal visible transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          <Text style={modalStyles.icon}>✧</Text>
          <Text style={modalStyles.title}>It's a match</Text>
          <Text style={modalStyles.subtitle}>
            You and {name} are both interested.
          </Text>
          <View style={modalStyles.scoreRow}>
            <Text style={[modalStyles.score, { color }]}>{score}</Text>
            <Text style={modalStyles.scoreLabel}> Breathing Room Score</Text>
          </View>
          <Text style={modalStyles.note}>
            No rush to message. Start when it feels right.
          </Text>
          <TouchableOpacity style={modalStyles.btn} onPress={onDismiss} activeOpacity={0.8}>
            <Text style={modalStyles.btnText}>Keep browsing</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: Colors.navyLight,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.sage,
    width: '100%',
  },
  icon: {
    fontSize: 40,
    color: Colors.sage,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.offwhite,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  score: {
    fontSize: 32,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  note: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  btn: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    backgroundColor: `${Colors.sage}20`,
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.sage,
  },
});

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  header: {
    paddingHorizontal: 8,
    paddingBottom: 16,
    gap: 4,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.offwhite,
  },
  stackCount: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  secondCard: {
    position: 'absolute',
    bottom: -6,
    width: '100%',
    alignItems: 'center',
  },
  secondCardInner: {
    width: '93%',
    height: 60,
    backgroundColor: Colors.navyLight,
    borderRadius: 24,
    opacity: 0.5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
