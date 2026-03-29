// ─── Matches screen ───────────────────────────────────────────────────────────
// Lists mutual matches with subtle unread indicators (no count badges).

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, breathingRoomColor } from '../../utils/colors';
import { useMatchStore } from '../../store/matchStore';
import { useChatStore } from '../../store/chatStore';
import type { Match } from '../../types';

// Format a date string to a relative time label
function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'just now';
  if (hours < 1) return `${minutes}m`;
  if (days < 1) return `${hours}h`;
  return `${days}d`;
}

interface MatchRowProps {
  match: Match;
  onPress: () => void;
}

function MatchRow({ match, onPress }: MatchRowProps) {
  const { profile, lastMessage, hasUnread, breathingRoomScore } = match;
  const brColor = breathingRoomColor(breathingRoomScore);
  const conversation = useChatStore((s) => s.getConversation(match.id));
  const isSlowLane = conversation?.slowLaneEnabled ?? false;

  const lastMsg = lastMessage ?? conversation?.messages[conversation.messages.length - 1];

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: profile.photoUri ?? 'https://i.pravatar.cc/100' }}
          style={styles.avatar}
        />
        {profile.isCurrentlyInQuietMode && (
          <View style={styles.quietDot}>
            <Text style={styles.quietDotIcon}>🌙</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            {isSlowLane && <Text style={styles.slowLaneTag}>Slow Lane</Text>}
          </View>
          <View style={styles.metaRight}>
            {lastMsg && (
              <Text style={styles.time}>{formatRelativeTime(lastMsg.sentAt)}</Text>
            )}
            {/* Subtle unread dot — no count, no red */}
            {hasUnread && <View style={styles.unreadDot} />}
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
            numberOfLines={1}
          >
            {lastMsg
              ? `${lastMsg.senderId === 'current_user' ? 'You: ' : ''}${lastMsg.text}`
              : 'Say hello whenever you\'re ready'}
          </Text>
          <Text style={[styles.brScore, { color: brColor }]}>{breathingRoomScore}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MatchesScreen() {
  const { matches } = useMatchStore();
  const hasUnreadAny = matches.some((m) => m.hasUnread);

  return (
    <LinearGradient colors={[Colors.navyDark, Colors.navy]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
          {hasUnreadAny && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>new</Text>
            </View>
          )}
        </View>

        {matches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✧</Text>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptySubtitle}>
              Head to Discover and swipe on profiles that resonate.
            </Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <MatchRow
                match={item}
                onPress={() => {
                  router.push(`/chat/${item.id}`);
                }}
              />
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.offwhite,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: `${Colors.sage}25`,
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  newBadgeText: {
    fontSize: 11,
    color: Colors.sage,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 82,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.navyLight,
  },
  quietDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  quietDotIcon: { fontSize: 10 },

  content: { flex: 1, gap: 4 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.offwhite,
  },
  slowLaneTag: {
    fontSize: 10,
    color: Colors.sandDark,
    fontStyle: 'italic',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.sage,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  brScore: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 40,
    color: Colors.sage,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.offwhite,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
