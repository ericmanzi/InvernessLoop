// ─── Chat screen ──────────────────────────────────────────────────────────────
// Renders the conversation between the current user and a match.
// Features: Slow Lane toggle, Quiet Mode banner, no read receipts, no typing indicators.

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colors';
import { useChatStore } from '../../store/chatStore';
import { useMatchStore } from '../../store/matchStore';
import { MessageBubble } from '../../components/MessageBubble';
import type { ChatMessage } from '../../types';

export default function ChatScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { getConversation, sendMessage, toggleSlowLane, ensureConversation } = useChatStore();
  const { matches, markMatchRead } = useMatchStore();

  // Ensure conversation exists
  useEffect(() => {
    if (matchId) {
      ensureConversation(matchId);
      markMatchRead(matchId);
    }
  }, [matchId, ensureConversation, markMatchRead]);

  const conversation = getConversation(matchId ?? '');
  const match = matches.find((m) => m.id === matchId);
  const profile = match?.profile;

  const messages = conversation?.messages ?? [];
  const isSlowLane = conversation?.slowLaneEnabled ?? false;
  const isRecipientInQuietMode = profile?.isCurrentlyInQuietMode ?? false;

  function handleSend() {
    const text = inputText.trim();
    if (!text || !matchId) return;

    sendMessage(matchId, 'current_user', text);

    // Update the match's lastMessage in the match store
    setTimeout(() => {
      useMatchStore.getState().updateLastMessage(matchId, {
        id: `preview_${Date.now()}`,
        matchId,
        senderId: 'current_user',
        text,
        sentAt: new Date().toISOString(),
        status: 'sent',
        isSlowLane: isSlowLane,
      });
    }, 100);

    setInputText('');
    // Scroll to bottom after sending
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }

  if (!profile) {
    return (
      <View style={styles.errorState}>
        <Text style={styles.errorText}>Conversation not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={[Colors.navyDark, Colors.navy]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
          {/* Custom header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: profile.photoUri ?? 'https://i.pravatar.cc/100' }}
              style={styles.headerAvatar}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{profile.name}</Text>
              <Text style={styles.headerStatus}>
                {profile.isCurrentlyInQuietMode
                  ? '🌙 In quiet mode'
                  : '● Available'}
              </Text>
            </View>
            {/* Breathing Room score pill */}
            {match && (
              <View style={styles.brPill}>
                <Text style={styles.brPillText}>{match.breathingRoomScore} BR</Text>
              </View>
            )}
          </View>

          {/* Slow Lane toggle */}
          <TouchableOpacity
            style={[styles.slowLaneBanner, isSlowLane && styles.slowLaneBannerActive]}
            onPress={() => toggleSlowLane(matchId ?? '')}
            activeOpacity={0.8}
          >
            <Text style={styles.slowLaneIcon}>⏳</Text>
            <View style={styles.slowLaneText}>
              <Text style={[styles.slowLaneTitle, isSlowLane && styles.slowLaneTitleActive]}>
                Slow Lane {isSlowLane ? 'on' : 'off'}
              </Text>
              {isSlowLane && (
                <Text style={styles.slowLaneSubtitle}>
                  Async conversation — respond when you're ready
                </Text>
              )}
            </View>
            <Text style={styles.slowLaneToggleHint}>tap to {isSlowLane ? 'disable' : 'enable'}</Text>
          </TouchableOpacity>

          {/* Quiet mode banner */}
          {isRecipientInQuietMode && (
            <View style={styles.quietBanner}>
              <Text style={styles.quietBannerIcon}>🌙</Text>
              <Text style={styles.quietBannerText}>
                {profile.name} is in quiet mode — your message will be delivered when they're back
              </Text>
            </View>
          )}

          {/* Messages list */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: ChatMessage }) => (
              <MessageBubble
                message={item}
                isOwn={item.senderId === 'current_user'}
              />
            )}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={() => (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatIcon}>✉️</Text>
                <Text style={styles.emptyChatText}>
                  Start the conversation whenever feels right.
                </Text>
                <Text style={styles.emptyChatSub}>No pressure.</Text>
              </View>
            )}
          />

          {/* Input area */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                isSlowLane
                  ? 'Write something thoughtful…'
                  : 'Message…'
              }
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.sendBtnText}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 6,
  },
  backArrow: {
    fontSize: 22,
    color: Colors.sand,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.navyLight,
  },
  headerInfo: { flex: 1, gap: 2 },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.offwhite,
  },
  headerStatus: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  brPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  brPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Slow Lane banner
  slowLaneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.navyLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  slowLaneBannerActive: {
    backgroundColor: `${Colors.sand}10`,
    borderBottomColor: `${Colors.sand}30`,
  },
  slowLaneIcon: { fontSize: 14 },
  slowLaneText: { flex: 1, gap: 1 },
  slowLaneTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  slowLaneTitleActive: {
    color: Colors.sand,
  },
  slowLaneSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  slowLaneToggleHint: {
    fontSize: 10,
    color: Colors.textMuted,
  },

  // Quiet mode banner
  quietBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: `${Colors.blush}12`,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.blush}30`,
  },
  quietBannerIcon: { fontSize: 14, marginTop: 1 },
  quietBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.blush,
    lineHeight: 17,
  },

  // Messages
  messagesList: {
    paddingTop: 12,
    paddingBottom: 8,
    flexGrow: 1,
  },

  // Empty state
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyChatIcon: { fontSize: 32 },
  emptyChatText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyChatSub: {
    fontSize: 13,
    color: Colors.textMuted,
  },

  // Input
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.navyDark,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtnText: {
    fontSize: 18,
    color: Colors.offwhite,
    fontWeight: '700',
  },

  // Error state
  errorState: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  backLink: {
    fontSize: 14,
    color: Colors.sage,
    textDecorationLine: 'underline',
  },
});
