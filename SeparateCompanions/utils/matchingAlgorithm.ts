// ─── Breathing Room Score ─────────────────────────────────────────────────────
// Calculates a 0–100 "Breathing Room" compatibility score between two users
// based on their space preferences. Higher score = more space-compatible.
// This is the core matching heuristic of Separate Companions.

import type { SpacePreferences, UserProfile } from '../types';

// ─── Numeric encodings for each preference dimension ─────────────────────────
// Lower number = more togetherness preference; higher = more space preference.

const TEXTING_RANK: Record<string, number> = {
  'once-a-day': 1,
  'few-times-a-week': 2,
  'when-inspired': 3,
};

const RESPONSE_TIME_RANK: Record<string, number> = {
  'within-hours': 1,
  'within-a-day': 2,
  'within-a-few-days': 3,
};

const IN_PERSON_RANK: Record<string, number> = {
  'daily': 1,
  'few-times-a-week': 2,
  'weekends': 3,
  'few-times-a-month': 4,
};

const SPACE_NEED_RANK: Record<string, number> = {
  'flexible': 1,
  'some-needed': 2,
  'lots-needed': 3,
};

// ─── Per-dimension compatibility ─────────────────────────────────────────────
// Returns 0–100 for a single dimension. Two people score highest when their
// values are either equal or within one "step" of each other.

function dimensionScore(rankA: number, rankB: number, maxRank: number): number {
  const diff = Math.abs(rankA - rankB);
  if (diff === 0) return 100;
  if (diff === 1) return 70;
  if (diff === 2) return 35;
  // maxRank 4 means a diff of 3 is possible for in-person frequency
  return 10;
}

// ─── Full space preferences compatibility score ───────────────────────────────
// Returns a breakdown and the weighted overall score.

export interface BreathingRoomBreakdown {
  overall: number;        // 0–100 weighted average
  texting: number;        // 0–100
  responseTime: number;   // 0–100
  inPerson: number;       // 0–100
  spaceNeed: number;      // 0–100
}

export function calculateBreathingRoom(
  a: SpacePreferences,
  b: SpacePreferences
): BreathingRoomBreakdown {
  const texting = dimensionScore(
    TEXTING_RANK[a.textingFrequency],
    TEXTING_RANK[b.textingFrequency],
    3
  );
  const responseTime = dimensionScore(
    RESPONSE_TIME_RANK[a.responseTimeExpectation],
    RESPONSE_TIME_RANK[b.responseTimeExpectation],
    3
  );
  const inPerson = dimensionScore(
    IN_PERSON_RANK[a.inPersonFrequency],
    IN_PERSON_RANK[b.inPersonFrequency],
    4
  );
  const spaceNeed = dimensionScore(
    SPACE_NEED_RANK[a.personalSpaceNeed],
    SPACE_NEED_RANK[b.personalSpaceNeed],
    3
  );

  // Weighted average — space need and in-person frequency carry more weight
  // because they're the most significant sources of friction in avoidant relationships.
  const overall = Math.round(
    texting * 0.20 +
    responseTime * 0.20 +
    inPerson * 0.35 +
    spaceNeed * 0.25
  );

  return { overall, texting, responseTime, inPerson, spaceNeed };
}

// ─── Profile-level helper ─────────────────────────────────────────────────────
// Convenience wrapper that accepts two full UserProfile objects.

export function profileBreathingRoom(a: UserProfile, b: UserProfile): BreathingRoomBreakdown {
  return calculateBreathingRoom(a.spacePreferences, b.spacePreferences);
}

// ─── Text summary of score ────────────────────────────────────────────────────

export function breathingRoomSummary(score: number): string {
  if (score >= 85) return 'Exceptional space harmony';
  if (score >= 70) return 'Great space compatibility';
  if (score >= 55) return 'Good breathing room match';
  if (score >= 40) return 'Some space negotiation needed';
  return 'Different space needs';
}
