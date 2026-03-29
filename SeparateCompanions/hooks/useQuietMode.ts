// ─── useQuietMode hook ────────────────────────────────────────────────────────
// Evaluates whether a user is currently within a quiet window based on their
// QuietWindow schedule and the current time.

import { useEffect, useCallback } from 'react';
import type { QuietWindow } from '../types';
import { useAuthStore } from '../store/authStore';

// ─── Core check: is the current moment within a given QuietWindow? ────────────

export function isWithinQuietWindow(window: QuietWindow): boolean {
  if (!window.enabled) return false;

  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun … 6=Sat
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentMinutes = currentHour * 60 + currentMinute;

  if (!window.daysOfWeek.includes(currentDay)) return false;

  const startMinutes = window.startHour * 60 + window.startMinute;
  const endMinutes = window.endHour * 60 + window.endMinute;

  if (startMinutes <= endMinutes) {
    // Same-day window e.g. 20:00 – 22:00
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight window e.g. 22:00 – 08:00
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

// ─── Check if any of a user's windows are currently active ───────────────────

export function isAnyWindowActive(windows: QuietWindow[]): boolean {
  return windows.some(isWithinQuietWindow);
}

// ─── Hook: subscribes to current-user quiet mode, re-evaluates every minute ──

export function useQuietMode() {
  const { currentUser, setQuietModeActive } = useAuthStore();

  const evaluate = useCallback(() => {
    if (!currentUser) return;
    const active = isAnyWindowActive(currentUser.quietWindows);
    // Only update if state changed to avoid unnecessary re-renders
    if (active !== currentUser.isCurrentlyInQuietMode) {
      setQuietModeActive(active);
    }
  }, [currentUser, setQuietModeActive]);

  useEffect(() => {
    evaluate();
    // Re-evaluate every 60 seconds
    const interval = setInterval(evaluate, 60 * 1000);
    return () => clearInterval(interval);
  }, [evaluate]);

  return {
    isInQuietMode: currentUser?.isCurrentlyInQuietMode ?? false,
    quietWindows: currentUser?.quietWindows ?? [],
  };
}

// ─── Format a QuietWindow for display ─────────────────────────────────────────

export function formatQuietWindow(window: QuietWindow): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const start = `${pad(window.startHour)}:${pad(window.startMinute)}`;
  const end = `${pad(window.endHour)}:${pad(window.endMinute)}`;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = window.daysOfWeek.map((d) => dayNames[d]).join(', ');
  return `${start} – ${end} · ${days}`;
}
