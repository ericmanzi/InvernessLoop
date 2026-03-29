// ─── Own Profile screen ───────────────────────────────────────────────────────
// Shows the current user's profile, space preferences, and Quiet Mode schedule.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colors';
import { useAuthStore } from '../../store/authStore';
import { QuietModeToggle } from '../../components/QuietModeToggle';
import { SpacePreferences } from '../../components/SpacePreferences';
import { BreathingRoomScore } from '../../components/BreathingRoomScore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { attachmentStyleLabel } from '../../utils/attachmentQuiz';
import { formatQuietWindow } from '../../hooks/useQuietMode';
import type { QuietWindow } from '../../types';

// ─── Add Quiet Window modal ───────────────────────────────────────────────────

interface AddWindowModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (w: Omit<QuietWindow, 'id'>) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function AddWindowModal({ visible, onClose, onAdd }: AddWindowModalProps) {
  const [label, setLabel] = useState('');
  const [startHour, setStartHour] = useState('22');
  const [startMin, setStartMin] = useState('00');
  const [endHour, setEndHour] = useState('08');
  const [endMin, setEndMin] = useState('00');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default

  function toggleDay(d: number) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  function handleAdd() {
    onAdd({
      label: label.trim() || 'Quiet window',
      startHour: parseInt(startHour, 10) || 22,
      startMinute: parseInt(startMin, 10) || 0,
      endHour: parseInt(endHour, 10) || 8,
      endMinute: parseInt(endMin, 10) || 0,
      daysOfWeek: days.length ? days : [1, 2, 3, 4, 5],
      enabled: true,
    });
    setLabel('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Add Quiet Window</Text>

          <View style={modalStyles.field}>
            <Text style={modalStyles.fieldLabel}>Label (optional)</Text>
            <TextInput
              style={modalStyles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Weekday evenings"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={modalStyles.timeRow}>
            <View style={modalStyles.timeField}>
              <Text style={modalStyles.fieldLabel}>Start hour (0–23)</Text>
              <TextInput
                style={modalStyles.input}
                value={startHour}
                onChangeText={setStartHour}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <Text style={modalStyles.timeSep}>:</Text>
            <View style={modalStyles.timeFieldSmall}>
              <Text style={modalStyles.fieldLabel}>Min</Text>
              <TextInput
                style={modalStyles.input}
                value={startMin}
                onChangeText={setStartMin}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <Text style={modalStyles.timeDash}>→</Text>
            <View style={modalStyles.timeField}>
              <Text style={modalStyles.fieldLabel}>End hour</Text>
              <TextInput
                style={modalStyles.input}
                value={endHour}
                onChangeText={setEndHour}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <Text style={modalStyles.timeSep}>:</Text>
            <View style={modalStyles.timeFieldSmall}>
              <Text style={modalStyles.fieldLabel}>Min</Text>
              <TextInput
                style={modalStyles.input}
                value={endMin}
                onChangeText={setEndMin}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.fieldLabel}>Days</Text>
            <View style={modalStyles.daysRow}>
              {DAY_LABELS.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[modalStyles.dayChip, days.includes(i) && modalStyles.dayChipSelected]}
                  onPress={() => toggleDay(i)}
                >
                  <Text style={[
                    modalStyles.dayChipText,
                    days.includes(i) && modalStyles.dayChipTextSelected,
                  ]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={modalStyles.actions}>
            <Button title="Cancel" variant="ghost" size="md" onPress={onClose} />
            <Button title="Add window" variant="primary" size="md" onPress={handleAdd} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
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
    gap: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.offwhite,
  },
  field: { gap: 8 },
  fieldLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  timeField: { flex: 2, gap: 6 },
  timeFieldSmall: { flex: 1, gap: 6 },
  timeSep: {
    fontSize: 18,
    color: Colors.textMuted,
    paddingBottom: 10,
  },
  timeDash: {
    fontSize: 14,
    color: Colors.textMuted,
    paddingBottom: 10,
    paddingHorizontal: 2,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  dayChip: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayChipSelected: {
    borderColor: Colors.blush,
    backgroundColor: `${Colors.blush}20`,
  },
  dayChipText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  dayChipTextSelected: {
    color: Colors.blush,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
});

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { currentUser, addQuietWindow, removeQuietWindow, toggleQuietWindow, logout } =
    useAuthStore();
  const [showAddWindow, setShowAddWindow] = useState(false);

  if (!currentUser) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  function handleAddWindow(w: Omit<QuietWindow, 'id'>) {
    addQuietWindow({ ...w, id: `qw_${Date.now()}` });
    setShowAddWindow(false);
  }

  return (
    <LinearGradient colors={[Colors.navyDark, Colors.navy]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile header */}
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: currentUser.photoUri ?? 'https://i.pravatar.cc/200?img=1' }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{currentUser.name}, {currentUser.age}</Text>
              <Badge
                label={attachmentStyleLabel(currentUser.attachmentStyle)}
                variant="attachment"
                attachmentStyle={currentUser.attachmentStyle}
                small
              />
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Bio */}
          {currentUser.bio ? (
            <View style={styles.bioSection}>
              <Text style={styles.bio}>{currentUser.bio}</Text>
            </View>
          ) : null}

          {/* Space preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Space preferences</Text>
            <View style={styles.sectionCard}>
              <SpacePreferences prefs={currentUser.spacePreferences} />
            </View>
          </View>

          {/* Quiet Mode */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quiet Mode</Text>
            <View style={styles.sectionCard}>
              <QuietModeToggle />
              <View style={styles.divider} />

              {/* Scheduled windows */}
              <Text style={styles.windowsTitle}>Scheduled windows</Text>
              {currentUser.quietWindows.length === 0 ? (
                <Text style={styles.noWindows}>
                  No recurring windows set. Add one to automate quiet mode.
                </Text>
              ) : (
                <View style={styles.windowsList}>
                  {currentUser.quietWindows.map((w) => (
                    <View key={w.id} style={styles.windowRow}>
                      <View style={styles.windowInfo}>
                        <Text style={styles.windowLabel}>{w.label}</Text>
                        <Text style={styles.windowTime}>{formatQuietWindow(w)}</Text>
                      </View>
                      <Switch
                        value={w.enabled}
                        onValueChange={() => toggleQuietWindow(w.id)}
                        trackColor={{ false: Colors.border, true: `${Colors.blush}60` }}
                        thumbColor={w.enabled ? Colors.blush : Colors.textMuted}
                      />
                      <TouchableOpacity
                        onPress={() => removeQuietWindow(w.id)}
                        style={styles.removeBtn}
                      >
                        <Text style={styles.removeBtnText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.addWindowBtn}
                onPress={() => setShowAddWindow(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.addWindowBtnText}>+ Add window</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionCard}>
              <Text style={styles.quizScore}>
                Attachment score: {currentUser.attachmentScore} / 100
              </Text>
              <View style={styles.divider} />
              <Button
                title="Sign out"
                variant="ghost"
                size="md"
                fullWidth
                onPress={logout}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <AddWindowModal
        visible={showAddWindow}
        onClose={() => setShowAddWindow(false)}
        onAdd={handleAddWindow}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  loading: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 24,
  },

  // Profile header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.navyLight,
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.offwhite,
  },
  editBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  editBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  bioSection: {
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bio: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Sections
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.sage,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.navyLight,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  // Quiet windows
  windowsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  noWindows: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  windowsList: { gap: 10 },
  windowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  windowInfo: { flex: 1, gap: 2 },
  windowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  windowTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  removeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 20,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  addWindowBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.blush,
    backgroundColor: `${Colors.blush}10`,
    alignSelf: 'flex-start',
  },
  addWindowBtnText: {
    fontSize: 13,
    color: Colors.blush,
    fontWeight: '600',
  },

  quizScore: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
