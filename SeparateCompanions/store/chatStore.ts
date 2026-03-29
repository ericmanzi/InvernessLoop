// ─── Chat / Conversations store ───────────────────────────────────────────────
// Manages all conversations and their messages.
// Seeded with two existing conversation histories.

import { create } from 'zustand';
import type { Conversation, ChatMessage } from '../types';

// ─── Seed conversation data ───────────────────────────────────────────────────

const now = Date.now();
const d = (offsetMs: number) => new Date(now - offsetMs).toISOString();

const SEED_CONVERSATIONS: Conversation[] = [
  {
    matchId: 'm1',
    slowLaneEnabled: false,
    messages: [
      {
        id: 'c1m1',
        matchId: 'm1',
        senderId: 'p1',
        text: 'Hi! I liked your profile. Your bit about intentional time really resonated.',
        sentAt: d(2 * 24 * 60 * 60 * 1000),
        status: 'delivered',
        isSlowLane: false,
      },
      {
        id: 'c1m2',
        matchId: 'm1',
        senderId: 'current_user',
        text: 'Thanks — it's something I think about a lot. What drew you to this app?',
        sentAt: d(1.5 * 24 * 60 * 60 * 1000),
        status: 'delivered',
        isSlowLane: false,
      },
      {
        id: 'c1m3',
        matchId: 'm1',
        senderId: 'p1',
        text: 'Honestly? Tired of apps that reward being constantly available. I reply when I have something real to say.',
        sentAt: d(1 * 24 * 60 * 60 * 1000),
        status: 'delivered',
        isSlowLane: false,
      },
      {
        id: 'c1m4',
        matchId: 'm1',
        senderId: 'p1',
        text: 'I liked your profile. No rush to reply.',
        sentAt: d(2 * 24 * 60 * 60 * 1000),
        status: 'delivered',
        isSlowLane: false,
      },
    ],
  },
  {
    matchId: 'm2',
    slowLaneEnabled: true,
    messages: [
      {
        id: 'c2m1',
        matchId: 'm2',
        senderId: 'current_user',
        text: 'Hey Saoirse — I saw you like hiking. Any favourite trails?',
        sentAt: d(6 * 24 * 60 * 60 * 1000),
        status: 'delivered',
        isSlowLane: true,
      },
      {
        id: 'c2m2',
        matchId: 'm2',
        senderId: 'p3',
        text: 'Yes! The coastal path near Donegal is incredible. Took me three days solo last autumn.',
        sentAt: d(5 * 24 * 60 * 60 * 1000),
        status: 'delivered',
        isSlowLane: true,
      },
      {
        id: 'c2m3',
        matchId: 'm2',
        senderId: 'current_user',
        text: 'That sounds incredible. I did the West Highland Way solo — nothing beats that quiet.',
        sentAt: d(4 * 24 * 60 * 60 * 1000),
        status: 'delivered',
        isSlowLane: true,
      },
      {
        id: 'c2m4',
        matchId: 'm2',
        senderId: 'p3',
        text: 'Exactly — there's something about solo movement in nature that resets everything.',
        sentAt: d(2 * 24 * 60 * 60 * 1000),
        status: 'delivered',
        isSlowLane: true,
      },
      {
        id: 'c2m5',
        matchId: 'm2',
        senderId: 'current_user',
        text: 'The weekend hike idea sounds perfect.',
        sentAt: d(5 * 60 * 60 * 1000),
        status: 'delivered',
        isSlowLane: true,
      },
    ],
  },
];

// ─── Store interface ───────────────────────────────────────────────────────────

interface ChatState {
  conversations: Conversation[];

  // Selectors
  getConversation: (matchId: string) => Conversation | undefined;

  // Actions
  sendMessage: (matchId: string, senderId: string, text: string, isQueued?: boolean) => ChatMessage;
  toggleSlowLane: (matchId: string) => void;
  ensureConversation: (matchId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: SEED_CONVERSATIONS,

  getConversation: (matchId) =>
    get().conversations.find((c) => c.matchId === matchId),

  sendMessage: (matchId, senderId, text, isQueued = false) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      matchId,
      senderId,
      text,
      sentAt: new Date().toISOString(),
      status: 'sent',
      isSlowLane: get().getConversation(matchId)?.slowLaneEnabled ?? false,
    };

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.matchId === matchId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      ),
    }));

    // Simulate message delivery after a short delay
    setTimeout(() => {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.matchId === matchId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMessage.id ? { ...m, status: 'delivered' as const } : m
                ),
              }
            : c
        ),
      }));
    }, 1500);

    return newMessage;
  },

  toggleSlowLane: (matchId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.matchId === matchId ? { ...c, slowLaneEnabled: !c.slowLaneEnabled } : c
      ),
    }));
  },

  ensureConversation: (matchId) => {
    const existing = get().getConversation(matchId);
    if (!existing) {
      const newConvo: Conversation = {
        matchId,
        slowLaneEnabled: false,
        messages: [],
      };
      set((state) => ({ conversations: [...state.conversations, newConvo] }));
    }
  },
}));
