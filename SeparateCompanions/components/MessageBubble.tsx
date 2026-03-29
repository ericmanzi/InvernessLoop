// ─── Message Bubble ───────────────────────────────────────────────────────────
// Chat message bubble — no read receipts, just sent/delivered status.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../utils/colors';
import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;  // true if sent by the current user
}

// Format sentAt timestamp to a short time string
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <View style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther]}>
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
          message.isSlowLane && styles.bubbleSlowLane,
        ]}
      >
        <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
          {message.text}
        </Text>

        {/* Timestamp and delivery status row */}
        <View style={styles.meta}>
          {message.isSlowLane && (
            <Text style={styles.slowLaneTag}>Slow Lane · </Text>
          )}
          <Text style={styles.time}>{formatTime(message.sentAt)}</Text>
          {isOwn && (
            <Text style={styles.status}>
              {' '}
              {message.status === 'delivered' ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    flexDirection: 'row',
  },
  wrapperOwn: {
    justifyContent: 'flex-end',
  },
  wrapperOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 4,
  },
  bubbleOwn: {
    backgroundColor: Colors.sageDark,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  // Slow lane bubbles get a slightly different border treatment
  bubbleSlowLane: {
    borderWidth: 1,
    borderColor: `${Colors.sand}40`,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  textOwn: {
    color: Colors.offwhite,
  },
  textOther: {
    color: Colors.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  time: {
    fontSize: 10,
    color: `${Colors.textMuted}CC`,
  },
  status: {
    fontSize: 10,
    color: `${Colors.sageLight}CC`,
  },
  slowLaneTag: {
    fontSize: 10,
    color: `${Colors.sandDark}CC`,
    fontStyle: 'italic',
  },
});
