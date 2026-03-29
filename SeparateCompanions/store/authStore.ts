// ─── Auth + current-user profile store ────────────────────────────────────────
// Persists user profile, quiz result, and onboarding state via AsyncStorage.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserProfile,
  AttachmentStyle,
  SpacePreferences,
  QuietWindow,
  QuizResult,
} from '../types';

const STORAGE_KEY = 'sc_auth_store';

interface AuthState {
  isOnboarded: boolean;
  isLoggedIn: boolean;
  currentUser: UserProfile | null;
  quizResult: QuizResult | null;

  // Actions
  completeQuiz: (result: QuizResult) => void;
  createProfile: (profile: Omit<UserProfile, 'attachmentStyle' | 'attachmentScore'>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSpacePreferences: (prefs: SpacePreferences) => void;
  addQuietWindow: (window: QuietWindow) => void;
  removeQuietWindow: (id: string) => void;
  toggleQuietWindow: (id: string) => void;
  setQuietModeActive: (active: boolean) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

// ─── Default space preferences ────────────────────────────────────────────────

const DEFAULT_SPACE_PREFS: SpacePreferences = {
  textingFrequency: 'few-times-a-week',
  responseTimeExpectation: 'within-a-day',
  inPersonFrequency: 'few-times-a-week',
  personalSpaceNeed: 'some-needed',
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  isOnboarded: false,
  isLoggedIn: false,
  currentUser: null,
  quizResult: null,

  completeQuiz: (result) => {
    set({ quizResult: result });
    persist(get());
  },

  createProfile: (profile) => {
    const { quizResult } = get();
    const fullProfile: UserProfile = {
      ...profile,
      attachmentStyle: quizResult?.attachmentStyle ?? 'secure-avoidant',
      attachmentScore: quizResult?.score ?? 30,
    };
    set({ currentUser: fullProfile, isOnboarded: true, isLoggedIn: true });
    persist(get());
  },

  updateProfile: (updates) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    set({ currentUser: updated });
    persist(get());
  },

  updateSpacePreferences: (prefs) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const updated = { ...currentUser, spacePreferences: prefs };
    set({ currentUser: updated });
    persist(get());
  },

  addQuietWindow: (window) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      quietWindows: [...currentUser.quietWindows, window],
    };
    set({ currentUser: updated });
    persist(get());
  },

  removeQuietWindow: (id) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      quietWindows: currentUser.quietWindows.filter((w) => w.id !== id),
    };
    set({ currentUser: updated });
    persist(get());
  },

  toggleQuietWindow: (id) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      quietWindows: currentUser.quietWindows.map((w) =>
        w.id === id ? { ...w, enabled: !w.enabled } : w
      ),
    };
    set({ currentUser: updated });
    persist(get());
  },

  setQuietModeActive: (active) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const updated = { ...currentUser, isCurrentlyInQuietMode: active };
    set({ currentUser: updated });
    persist(get());
  },

  logout: () => {
    set({ isOnboarded: false, isLoggedIn: false, currentUser: null, quizResult: null });
    AsyncStorage.removeItem(STORAGE_KEY);
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<AuthState>;
        set({
          isOnboarded: saved.isOnboarded ?? false,
          isLoggedIn: saved.isLoggedIn ?? false,
          currentUser: saved.currentUser ?? null,
          quizResult: saved.quizResult ?? null,
        });
      }
    } catch (e) {
      // If hydration fails, start fresh
      console.warn('Auth store hydration failed:', e);
    }
  },
}));

// ─── Persistence helper ───────────────────────────────────────────────────────

function persist(state: AuthState) {
  const toSave = {
    isOnboarded: state.isOnboarded,
    isLoggedIn: state.isLoggedIn,
    currentUser: state.currentUser,
    quizResult: state.quizResult,
  };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
}
