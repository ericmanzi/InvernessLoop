// ─── Attachment style quiz ────────────────────────────────────────────────────
// 10 questions assessing avoidant attachment tendencies.
// Each answer option carries a numeric value (0–10).
// Higher total score → more avoidant tendency.
// Score buckets:
//   0–39   → secure-avoidant
//   40–64  → lightly-avoidant
//   65–100 → strongly-avoidant

import type { QuizQuestion, QuizResult, AttachmentStyle } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'When someone texts you multiple times in a row, you feel…',
    options: [
      { value: 0, label: 'Warm — they must be thinking of me' },
      { value: 4, label: 'Fine, but I'll reply when I'm ready' },
      { value: 7, label: 'Mildly overwhelmed — I prefer one message' },
      { value: 10, label: 'Anxious — my space feels invaded' },
    ],
  },
  {
    id: 2,
    question: 'Your ideal relationship involves seeing your partner…',
    options: [
      { value: 0, label: 'Every single day — the more the better' },
      { value: 3, label: 'Most days, but some apart time is nice' },
      { value: 7, label: 'A few times a week with solo time in between' },
      { value: 10, label: 'Intentionally scheduled — maybe weekends only' },
    ],
  },
  {
    id: 3,
    question: 'When a partner wants to spend every weekend together, you…',
    options: [
      { value: 0, label: 'Love it — quality time matters most' },
      { value: 4, label: 'Enjoy it mostly, with the occasional solo day' },
      { value: 7, label: 'Feel a gentle pull to reclaim some weekends' },
      { value: 10, label: 'Need to negotiate — solo weekends are non-negotiable' },
    ],
  },
  {
    id: 4,
    question: 'After a long social day, you recharge by…',
    options: [
      { value: 0, label: 'Calling a close friend or partner — connection helps' },
      { value: 3, label: 'A mix — some downtime then maybe a call' },
      { value: 7, label: 'Being alone with a book or hobby' },
      { value: 10, label: 'Strictly solo time; social energy needs full recovery' },
    ],
  },
  {
    id: 5,
    question: 'How do you feel about a partner tracking your location?',
    options: [
      { value: 0, label: 'Totally fine — we share everything' },
      { value: 3, label: 'OK in specific situations (travel, safety)' },
      { value: 7, label: 'Uncomfortable — I prefer check-ins instead' },
      { value: 10, label: 'Hard no — that's my privacy' },
    ],
  },
  {
    id: 6,
    question: 'When a partner says "we need to talk," you immediately feel…',
    options: [
      { value: 0, label: 'Curious and ready to connect' },
      { value: 4, label: 'Slightly nervous but willing' },
      { value: 7, label: 'Tense — I'd rather they just said what they mean' },
      { value: 10, label: 'A strong urge to create emotional distance first' },
    ],
  },
  {
    id: 7,
    question: 'Your phone notification style for a romantic partner is…',
    options: [
      { value: 0, label: 'All alerts on — I want to be reachable' },
      { value: 3, label: 'Banners on, but I reply when free' },
      { value: 7, label: 'Notifications off — I check on my schedule' },
      { value: 10, label: 'Do Not Disturb most of the time' },
    ],
  },
  {
    id: 8,
    question: 'When you imagine a long-term relationship, your living arrangement would ideally be…',
    options: [
      { value: 0, label: 'Fully shared — every room together' },
      { value: 3, label: 'Shared home with some personal-space rooms' },
      { value: 7, label: 'Same place but very separate routines' },
      { value: 10, label: 'Living apart together (LAT) — separate homes' },
    ],
  },
  {
    id: 9,
    question: 'How important is it that a partner respects your "me time" without asking?',
    options: [
      { value: 0, label: 'Not important — I'd rather talk it through' },
      { value: 3, label: 'Somewhat — a heads-up would be nice' },
      { value: 7, label: 'Important — I shouldn't have to explain needing space' },
      { value: 10, label: 'Essential — it's the foundation of trust for me' },
    ],
  },
  {
    id: 10,
    question: 'When you haven't heard from a partner in 24 hours, you feel…',
    options: [
      { value: 0, label: 'Worried — I prefer regular check-ins' },
      { value: 3, label: 'Fine, but a quick note would be reassuring' },
      { value: 7, label: 'Completely comfortable — I trust them' },
      { value: 10, label: 'Relieved — the quiet feels like breathing room' },
    ],
  },
];

// ─── Score → attachment style classification ──────────────────────────────────

export function classifyAttachmentStyle(score: number): AttachmentStyle {
  if (score < 40) return 'secure-avoidant';
  if (score < 65) return 'lightly-avoidant';
  return 'strongly-avoidant';
}

// ─── Human-readable descriptions for each style ───────────────────────────────

const STYLE_DESCRIPTIONS: Record<AttachmentStyle, string> = {
  'secure-avoidant':
    'You value independence and also enjoy genuine connection. You are comfortable with closeness when it respects your boundaries, and you partner well with people who share that balance.',
  'lightly-avoidant':
    'You lean toward independence and prefer relationships with room to breathe. You connect deeply on your own timeline and do best with partners who don\'t mistake space for distance.',
  'strongly-avoidant':
    'Your autonomy is central to your identity. You thrive in relationships built on mutual independence, clear personal space, and communication that never feels like an obligation.',
};

// ─── Compute the final quiz result from an array of selected answer values ────

export function computeQuizResult(selectedValues: number[]): QuizResult {
  // Raw sum of selected values. Max possible = 10 × 10 = 100.
  const rawScore = selectedValues.reduce((acc, v) => acc + v, 0);

  // Normalise to 0–100 (already is 0–100 for 10 questions, each 0–10)
  const score = Math.min(100, Math.max(0, rawScore));
  const attachmentStyle = classifyAttachmentStyle(score);

  return {
    score,
    attachmentStyle,
    description: STYLE_DESCRIPTIONS[attachmentStyle],
  };
}

// ─── Display-friendly style labels ───────────────────────────────────────────

export function attachmentStyleLabel(style: AttachmentStyle): string {
  switch (style) {
    case 'secure-avoidant':   return 'Secure-Avoidant';
    case 'lightly-avoidant':  return 'Lightly Avoidant';
    case 'strongly-avoidant': return 'Strongly Avoidant';
  }
}
