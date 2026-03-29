// ─── useBreathingRoom hook ─────────────────────────────────────────────────────
// Memoised hook that returns the Breathing Room compatibility breakdown between
// the current user and another profile.

import { useMemo } from 'react';
import type { SpacePreferences } from '../types';
import { calculateBreathingRoom, type BreathingRoomBreakdown } from '../utils/matchingAlgorithm';
import { useAuthStore } from '../store/authStore';

export function useBreathingRoom(otherPrefs: SpacePreferences): BreathingRoomBreakdown | null {
  const currentUser = useAuthStore((s) => s.currentUser);

  return useMemo(() => {
    if (!currentUser) return null;
    return calculateBreathingRoom(currentUser.spacePreferences, otherPrefs);
  }, [currentUser, otherPrefs]);
}
