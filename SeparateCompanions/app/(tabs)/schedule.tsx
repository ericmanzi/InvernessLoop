// ─── We Time Scheduler ────────────────────────────────────────────────────────
// Allows users to propose and view intentional connection slots with matches.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colors';
import { useMatchStore } from '../../store/matchStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { WeTimeSlot, WeTimeActivityType } from '../../types';

// ─── Seed We Time slots ───────────────────────────────────────────────────────

const INITIAL_SLOTS: WeTimeSlot[] = [
  {
    id: 'wt1',
    matchId: 'm1',
    proposedBy: 'p1',
    activityType: 'coffee',
    activityLabel: 'Morning coffee',
    scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 60,
    note: 'The quiet café on the corner?',
    status: 'confirmed',
  },
  {
    id: 'wt2',
    matchId: 'm2',
    proposedBy: 'current_user',
    activityType: 'walk',
    activityLabel: 'Evening walk',
    scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 90,
    note: 'Canal path, no agenda',
    status: 'pending',
  },
];

const ACTIVITY_OPTIONS: { value: WeTimeActivityType; label: string; icon: string }[] = [
  { value: 'coffee', label: 'Coffee', icon: '☕' },
  { value: 'walk', label: 'Walk', icon: '🚶' },
  { value: 'dinner', label: 'Dinner', icon: '🍽' },
  { value: 'movie', label: 'Movie', icon: '🎬' },
  { value: 'call', label: 'Call', icon: '📞' },
  { value: 'other', label: 'Other', icon: '✧' },
];

function formatSlotDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getProfileName(matchId: string): string {
  const match = useMatchStore.getState().matches.find((m) => m.id === matchId);
  return match?.profile.name ?? 'Your match';
}

// ─── Slot card ────────────────────────────────────────────────────────────────

interface SlotCardProps {
  slot: WeTimeSlot;
  onConfirm?: () => void;
  onDecline?: () => void;
}

function SlotCard({ slot, onConfirm, onDecline }: SlotCardProps) {
  const activity = ACTIVITY_OPTIONS.find((a) => a.value === slot.activityType);
  const profileName = getProfileName(slot.matchId);
  const isProposedByMe = slot.proposedBy === 'current_user';
  const isPending = slot.status === 'pending';

  return (
    <View style={slotStyles.card}>
      <View style={slotStyles.header}>
        <Text style={slotStyles.activityIcon}>{activity?.icon ?? '✧'}</Text>
        <View style={slotStyles.activityInfo}>
          <Text style={slotStyles.activityLabel}>{slot.activityLabel}</Text>
          <Text style={slotStyles.with}>
            {isProposedByMe ? `Proposed to ${profileName}` : `Proposed by ${profileName}`}
          </Text>
        </View>
        <Badge
          label={slot.status}
          variant={slot.status === 'confirmed' ? 'confirmed' : 'pending'}
          small
        />
      </View>

      <View style={slotStyles.dateRow}>
        <Text style={slotStyles.dateIcon}>📅</Text>
        <Text style={slotStyles.date}>{formatSlotDate(slot.scheduledFor)}</Text>
        <Text style={slotStyles.duration}>· {slot.durationMinutes}min</Text>
      </View>

      {slot.note && (
        <Text style={slotStyles.note}>"{slot.note}"</Text>
      )}

      {/* Action buttons for incoming pending slots */}
      {isPending && !isProposedByMe && onConfirm && onDecline && (
        <View style={slotStyles.actions}>
          <TouchableOpacity style={slotStyles.confirmBtn} onPress={onConfirm} activeOpacity={0.8}>
            <Text style={slotStyles.confirmBtnText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={slotStyles.declineBtn} onPress={onDecline} activeOpacity={0.8}>
            <Text style={slotStyles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const slotStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.navyLight,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: { fontSize: 22 },
  activityInfo: { flex: 1, gap: 2 },
  activityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.offwhite,
  },
  with: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateIcon: { fontSize: 12 },
  date: {
    fontSize: 13,
    color: Colors.sand,
    fontWeight: '500',
  },
  duration: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  note: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: `${Colors.sage}20`,
    borderWidth: 1,
    borderColor: Colors.sage,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.sage,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  declineBtnText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});

// ─── Propose modal ─────────────────────────────────────────────────────────────

interface ProposeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (slot: Omit<WeTimeSlot, 'id' | 'status'>) => void;
}

function ProposeModal({ visible, onClose, onSubmit }: ProposeModalProps) {
  const matches = useMatchStore((s) => s.matches);
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id ?? '');
  const [selectedActivity, setSelectedActivity] = useState<WeTimeActivityType>('coffee');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  function handleSubmit() {
    if (!selectedMatchId) return;
    const activity = ACTIVITY_OPTIONS.find((a) => a.value === selectedActivity);
    onSubmit({
      matchId: selectedMatchId,
      proposedBy: 'current_user',
      activityType: selectedActivity,
      activityLabel: activity?.label ?? 'Time together',
      scheduledFor: new Date(`${date || new Date().toISOString().split('T')[0]}T${time || '18:00'}:00`).toISOString(),
      durationMinutes: 90,
      note: note.trim() || undefined,
    });
    setNote('');
    setDate('');
    setTime('');
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={proposeStyles.overlay}>
        <View style={proposeStyles.sheet}>
          <View style={proposeStyles.handle} />
          <Text style={proposeStyles.title}>Propose We Time</Text>

          {/* Match picker */}
          <View style={proposeStyles.section}>
            <Text style={proposeStyles.label}>With</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={proposeStyles.matchRow}>
                {matches.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      proposeStyles.matchChip,
                      selectedMatchId === m.id && proposeStyles.matchChipSelected,
                    ]}
                    onPress={() => setSelectedMatchId(m.id)}
                  >
                    <Text style={proposeStyles.matchChipText}>{m.profile.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Activity picker */}
          <View style={proposeStyles.section}>
            <Text style={proposeStyles.label}>Activity</Text>
            <View style={proposeStyles.activityGrid}>
              {ACTIVITY_OPTIONS.map((a) => (
                <TouchableOpacity
                  key={a.value}
                  style={[
                    proposeStyles.activityChip,
                    selectedActivity === a.value && proposeStyles.activityChipSelected,
                  ]}
                  onPress={() => setSelectedActivity(a.value)}
                >
                  <Text style={proposeStyles.activityIcon}>{a.icon}</Text>
                  <Text style={[
                    proposeStyles.activityLabel,
                    selectedActivity === a.value && proposeStyles.activityLabelSelected,
                  ]}>
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date + time */}
          <View style={proposeStyles.dateTimeRow}>
            <View style={proposeStyles.dateField}>
              <Text style={proposeStyles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={proposeStyles.input}
                value={date}
                onChangeText={setDate}
                placeholder="2026-04-15"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={proposeStyles.timeField}>
              <Text style={proposeStyles.label}>Time (HH:MM)</Text>
              <TextInput
                style={proposeStyles.input}
                value={time}
                onChangeText={setTime}
                placeholder="18:00"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Note */}
          <View style={proposeStyles.section}>
            <Text style={proposeStyles.label}>Optional note</Text>
            <TextInput
              style={proposeStyles.input}
              value={note}
              onChangeText={setNote}
              placeholder="Any context or location preference…"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={proposeStyles.actions}>
            <Button title="Cancel" variant="ghost" size="md" onPress={onClose} />
            <Button title="Propose" variant="primary" size="md" onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const proposeStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.navyLight,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.offwhite,
  },
  section: { gap: 10 },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  matchRow: { flexDirection: 'row', gap: 8 },
  matchChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  matchChipSelected: {
    borderColor: Colors.sage,
    backgroundColor: `${Colors.sage}20`,
  },
  matchChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityChipSelected: {
    borderColor: Colors.sage,
    backgroundColor: `${Colors.sage}20`,
  },
  activityIcon: { fontSize: 14 },
  activityLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activityLabelSelected: {
    color: Colors.sage,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: { flex: 2, gap: 6 },
  timeField: { flex: 1, gap: 6 },
  input: {
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
});

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function ScheduleScreen() {
  const [slots, setSlots] = useState<WeTimeSlot[]>(INITIAL_SLOTS);
  const [showModal, setShowModal] = useState(false);

  function handlePropose(slot: Omit<WeTimeSlot, 'id' | 'status'>) {
    const newSlot: WeTimeSlot = {
      ...slot,
      id: `wt_${Date.now()}`,
      status: 'pending',
    };
    setSlots((prev) => [...prev, newSlot]);
    setShowModal(false);
  }

  function confirmSlot(id: string) {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'confirmed' } : s))
    );
  }

  function declineSlot(id: string) {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'declined' } : s))
    );
  }

  const upcoming = slots.filter((s) => s.status !== 'declined');
  const declined = slots.filter((s) => s.status === 'declined');

  return (
    <LinearGradient colors={[Colors.navyDark, Colors.navy]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>We Time</Text>
              <Text style={styles.subtitle}>Intentional time together</Text>
            </View>
            <TouchableOpacity
              style={styles.proposeBtn}
              onPress={() => setShowModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.proposeBtnText}>+ Propose</Text>
            </TouchableOpacity>
          </View>

          {/* Philosophy note */}
          <View style={styles.philosophy}>
            <Text style={styles.philosophyIcon}>🌿</Text>
            <Text style={styles.philosophyText}>
              Intentional time &gt; constant availability. Schedule the moments that matter.
            </Text>
          </View>

          {/* Slots */}
          {upcoming.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🗓</Text>
              <Text style={styles.emptyTitle}>No We Time yet</Text>
              <Text style={styles.emptySubtitle}>
                Propose a slot with one of your matches to get started.
              </Text>
            </View>
          ) : (
            <View style={styles.slotsList}>
              {upcoming.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onConfirm={() => confirmSlot(slot.id)}
                  onDecline={() => declineSlot(slot.id)}
                />
              ))}
            </View>
          )}

          {declined.length > 0 && (
            <View style={styles.declinedSection}>
              <Text style={styles.declinedTitle}>Declined</Text>
              {declined.map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <ProposeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handlePropose}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.offwhite,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  proposeBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: `${Colors.sage}20`,
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  proposeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.sage,
  },
  philosophy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.navyLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  philosophyIcon: { fontSize: 14, marginTop: 1 },
  philosophyText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  slotsList: { gap: 12 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 14,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.offwhite,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 24,
  },
  declinedSection: { gap: 10, opacity: 0.5 },
  declinedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
