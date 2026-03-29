// ─── Match + Discovery store ───────────────────────────────────────────────────
// Manages the discover card stack, swipe history, and matched profiles.
// Initialised with seed data so the app works without a backend.

import { create } from 'zustand';
import type { UserProfile, Match, SwipeDirection, SpacePreferences } from '../types';
import { profileBreathingRoom } from '../utils/matchingAlgorithm';

// ─── Seed profiles ────────────────────────────────────────────────────────────
// Six discoverable profiles with varied space preferences.

const SEED_PROFILES: UserProfile[] = [
  {
    id: 'p1',
    name: 'Lena',
    age: 29,
    bio: 'Mornings are mine. Evenings, occasionally yours. I believe in showing up fully — just not every day.',
    photoUri: 'https://i.pravatar.cc/400?img=47',
    attachmentStyle: 'lightly-avoidant',
    attachmentScore: 52,
    spacePreferences: {
      textingFrequency: 'few-times-a-week',
      responseTimeExpectation: 'within-a-day',
      inPersonFrequency: 'few-times-a-week',
      personalSpaceNeed: 'some-needed',
    },
    quietWindows: [],
    isCurrentlyInQuietMode: false,
  },
  {
    id: 'p2',
    name: 'Marcus',
    age: 33,
    bio: 'Architect of my own time. Looking for someone who understands that a good book and a quiet apartment is not loneliness.',
    photoUri: 'https://i.pravatar.cc/400?img=12',
    attachmentStyle: 'strongly-avoidant',
    attachmentScore: 78,
    spacePreferences: {
      textingFrequency: 'when-inspired',
      responseTimeExpectation: 'within-a-few-days',
      inPersonFrequency: 'few-times-a-month',
      personalSpaceNeed: 'lots-needed',
    },
    quietWindows: [],
    isCurrentlyInQuietMode: true,
  },
  {
    id: 'p3',
    name: 'Saoirse',
    age: 27,
    bio: 'Long solo hikes, short messages. Let's share experiences intentionally rather than constantly.',
    photoUri: 'https://i.pravatar.cc/400?img=56',
    attachmentStyle: 'lightly-avoidant',
    attachmentScore: 58,
    spacePreferences: {
      textingFrequency: 'few-times-a-week',
      responseTimeExpectation: 'within-a-day',
      inPersonFrequency: 'weekends',
      personalSpaceNeed: 'some-needed',
    },
    quietWindows: [],
    isCurrentlyInQuietMode: false,
  },
  {
    id: 'p4',
    name: 'Theo',
    age: 31,
    bio: 'I need to be able to disappear into my studio without explanation. If that sounds healthy to you, let's talk — eventually.',
    photoUri: 'https://i.pravatar.cc/400?img=33',
    attachmentStyle: 'strongly-avoidant',
    attachmentScore: 82,
    spacePreferences: {
      textingFrequency: 'when-inspired',
      responseTimeExpectation: 'within-a-few-days',
      inPersonFrequency: 'weekends',
      personalSpaceNeed: 'lots-needed',
    },
    quietWindows: [],
    isCurrentlyInQuietMode: false,
  },
  {
    id: 'p5',
    name: 'Priya',
    age: 28,
    bio: 'Researcher by day, hermit by night. I value depth over frequency. One thoughtful message beats ten check-ins.',
    photoUri: 'https://i.pravatar.cc/400?img=44',
    attachmentStyle: 'secure-avoidant',
    attachmentScore: 38,
    spacePreferences: {
      textingFrequency: 'once-a-day',
      responseTimeExpectation: 'within-a-day',
      inPersonFrequency: 'few-times-a-week',
      personalSpaceNeed: 'some-needed',
    },
    quietWindows: [],
    isCurrentlyInQuietMode: false,
  },
  {
    id: 'p6',
    name: 'Nils',
    age: 35,
    bio: 'Living apart together is not a compromise — it's the dream. My calendar has sacred solo blocks and I protect them.',
    photoUri: 'https://i.pravatar.cc/400?img=52',
    attachmentStyle: 'strongly-avoidant',
    attachmentScore: 90,
    spacePreferences: {
      textingFrequency: 'when-inspired',
      responseTimeExpectation: 'within-a-few-days',
      inPersonFrequency: 'few-times-a-month',
      personalSpaceNeed: 'lots-needed',
    },
    quietWindows: [],
    isCurrentlyInQuietMode: false,
  },
];

// ─── Seed matches (pre-existing, with conversation starters) ─────────────────

const SEED_MATCHES: Match[] = [
  {
    id: 'm1',
    profile: SEED_PROFILES[0], // Lena
    matchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    breathingRoomScore: 0, // computed below
    lastMessage: {
      id: 'msg_seed_1',
      matchId: 'm1',
      senderId: 'p1',
      text: 'I liked your profile. No rush to reply.',
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'delivered',
      isSlowLane: false,
    },
    hasUnread: true,
  },
  {
    id: 'm2',
    profile: SEED_PROFILES[2], // Saoirse
    matchedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    breathingRoomScore: 0, // computed below
    lastMessage: {
      id: 'msg_seed_2',
      matchId: 'm2',
      senderId: 'current_user',
      text: 'The weekend hike idea sounds perfect.',
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: 'delivered',
      isSlowLane: true,
    },
    hasUnread: false,
  },
];

// ─── Store interface ───────────────────────────────────────────────────────────

interface MatchState {
  discoverStack: UserProfile[];
  matches: Match[];
  swipedIds: string[];

  // Actions
  swipe: (profileId: string, direction: SwipeDirection, currentUserPrefs: SpacePreferences) => void;
  addMatch: (profile: UserProfile, score: number) => void;
  markMatchRead: (matchId: string) => void;
  updateLastMessage: (matchId: string, message: Match['lastMessage']) => void;
}

export const useMatchStore = create<MatchState>((set, get) => {
  // Pre-compute breathing room scores for seed matches
  // (using a placeholder "average avoidant" user prefs for initial seed)
  const avgPrefs: SpacePreferences = {
    textingFrequency: 'few-times-a-week',
    responseTimeExpectation: 'within-a-day',
    inPersonFrequency: 'few-times-a-week',
    personalSpaceNeed: 'some-needed',
  };

  const seededMatches = SEED_MATCHES.map((m) => ({
    ...m,
    breathingRoomScore: profileBreathingRoom(
      { ...m.profile, spacePreferences: m.profile.spacePreferences },
      { id: 'cu', name: '', age: 0, bio: '', attachmentStyle: 'secure-avoidant', attachmentScore: 35, spacePreferences: avgPrefs, quietWindows: [], isCurrentlyInQuietMode: false }
    ).overall,
  }));

  return {
    discoverStack: SEED_PROFILES,
    matches: seededMatches,
    swipedIds: [],

    swipe: (profileId, direction, currentUserPrefs) => {
      const { discoverStack, matches } = get();
      const profile = discoverStack.find((p) => p.id === profileId);
      if (!profile) return;

      // Remove from discover stack
      const newStack = discoverStack.filter((p) => p.id !== profileId);

      if (direction === 'like') {
        // Simulate a mutual match ~70% of the time for seed profiles
        const isMutual = Math.random() < 0.7;
        if (isMutual) {
          const score = profileBreathingRoom(
            { ...profile },
            {
              id: 'current_user',
              name: 'You',
              age: 30,
              bio: '',
              attachmentStyle: 'secure-avoidant',
              attachmentScore: 40,
              spacePreferences: currentUserPrefs,
              quietWindows: [],
              isCurrentlyInQuietMode: false,
            }
          ).overall;

          const newMatch: Match = {
            id: `m_${profileId}_${Date.now()}`,
            profile,
            matchedAt: new Date().toISOString(),
            breathingRoomScore: score,
            hasUnread: false,
          };

          set({
            discoverStack: newStack,
            matches: [...matches, newMatch],
            swipedIds: [...get().swipedIds, profileId],
          });
          return;
        }
      }

      set({
        discoverStack: newStack,
        swipedIds: [...get().swipedIds, profileId],
      });
    },

    addMatch: (profile, score) => {
      const newMatch: Match = {
        id: `m_${profile.id}_${Date.now()}`,
        profile,
        matchedAt: new Date().toISOString(),
        breathingRoomScore: score,
        hasUnread: false,
      };
      set((state) => ({ matches: [...state.matches, newMatch] }));
    },

    markMatchRead: (matchId) => {
      set((state) => ({
        matches: state.matches.map((m) =>
          m.id === matchId ? { ...m, hasUnread: false } : m
        ),
      }));
    },

    updateLastMessage: (matchId, message) => {
      set((state) => ({
        matches: state.matches.map((m) =>
          m.id === matchId ? { ...m, lastMessage: message } : m
        ),
      }));
    },
  };
});
