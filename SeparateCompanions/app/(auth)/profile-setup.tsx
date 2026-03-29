// ─── Profile Setup ────────────────────────────────────────────────────────────
// Collects name, age, bio, and space preference sliders.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colors';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import type {
  SpacePreferences,
  TextingFrequency,
  ResponseTimeExpectation,
  InPersonFrequency,
  PersonalSpaceNeed,
} from '../../types';

// ─── Preference option definitions ────────────────────────────────────────────

const TEXTING_OPTIONS: { value: TextingFrequency; label: string }[] = [
  { value: 'once-a-day', label: 'Once a day' },
  { value: 'few-times-a-week', label: 'Few times a week' },
  { value: 'when-inspired', label: 'When inspired' },
];

const RESPONSE_OPTIONS: { value: ResponseTimeExpectation; label: string }[] = [
  { value: 'within-hours', label: 'Within hours' },
  { value: 'within-a-day', label: 'Within a day' },
  { value: 'within-a-few-days', label: 'Within a few days' },
];

const IN_PERSON_OPTIONS: { value: InPersonFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'few-times-a-week', label: 'Few times a week' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'few-times-a-month', label: 'Few times a month' },
];

const SPACE_OPTIONS: { value: PersonalSpaceNeed; label: string }[] = [
  { value: 'flexible', label: 'Flexible' },
  { value: 'some-needed', label: 'Some needed' },
  { value: 'lots-needed', label: 'Lots needed' },
];

// ─── Chip selector component ──────────────────────────────────────────────────

interface ChipSelectorProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (v: T) => void;
}

function ChipSelector<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: ChipSelectorProps<T>) {
  return (
    <View style={chipStyles.container}>
      <Text style={chipStyles.label}>{label}</Text>
      <View style={chipStyles.row}>
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[chipStyles.chip, isSelected && chipStyles.chipSelected]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.75}
            >
              <Text style={[chipStyles.chipText, isSelected && chipStyles.chipTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  container: { gap: 10 },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    borderColor: Colors.sage,
    backgroundColor: `${Colors.sage}20`,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.sage,
    fontWeight: '600',
  },
});

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function ProfileSetupScreen() {
  const createProfile = useAuthStore((s) => s.createProfile);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');

  const [spacePrefs, setSpacePrefs] = useState<SpacePreferences>({
    textingFrequency: 'few-times-a-week',
    responseTimeExpectation: 'within-a-day',
    inPersonFrequency: 'few-times-a-week',
    personalSpaceNeed: 'some-needed',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function updatePref<K extends keyof SpacePreferences>(key: K, value: SpacePreferences[K]) {
    setSpacePrefs((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Please enter your name';
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      e.age = 'Please enter a valid age (18+)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCreate() {
    if (!validate()) return;

    createProfile({
      id: 'current_user',
      name: name.trim(),
      age: parseInt(age, 10),
      bio: bio.trim() || 'Enjoying my own company and occasionally yours.',
      photoUri: 'https://i.pravatar.cc/400?img=1',
      spacePreferences: spacePrefs,
      quietWindows: [],
      isCurrentlyInQuietMode: false,
    });

    router.replace('/(tabs)/discover');
  }

  return (
    <LinearGradient colors={[Colors.navyDark, Colors.navy]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your profile</Text>
            <Text style={styles.subtitle}>
              This is what potential matches will see. Be honest — you'll find your people.
            </Text>
          </View>

          {/* Photo placeholder */}
          <View style={styles.photoSection}>
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoHint}>Add photos later</Text>
            </View>
          </View>

          {/* Basic info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic info</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={[styles.input, errors.age && styles.inputError]}
                value={age}
                onChangeText={setAge}
                placeholder="Your age"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                What does the perfect amount of space look like to you?
              </Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Share a little about your ideal relationship dynamic…"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Space preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Space preferences</Text>
            <Text style={styles.sectionNote}>
              These drive your Breathing Room compatibility score. Be genuine.
            </Text>

            <ChipSelector
              label="Ideal texting frequency"
              options={TEXTING_OPTIONS}
              selected={spacePrefs.textingFrequency}
              onSelect={(v) => updatePref('textingFrequency', v)}
            />
            <ChipSelector
              label="Response time expectation"
              options={RESPONSE_OPTIONS}
              selected={spacePrefs.responseTimeExpectation}
              onSelect={(v) => updatePref('responseTimeExpectation', v)}
            />
            <ChipSelector
              label="Ideal in-person frequency"
              options={IN_PERSON_OPTIONS}
              selected={spacePrefs.inPersonFrequency}
              onSelect={(v) => updatePref('inPersonFrequency', v)}
            />
            <ChipSelector
              label="Personal space in a relationship"
              options={SPACE_OPTIONS}
              selected={spacePrefs.personalSpaceNeed}
              onSelect={(v) => updatePref('personalSpaceNeed', v)}
            />
          </View>

          <View style={styles.cta}>
            <Button
              title="Create my profile"
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleCreate}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
    gap: 32,
  },

  header: { gap: 10 },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.offwhite,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  photoSection: { alignItems: 'center' },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.navyLight,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoIcon: { fontSize: 28 },
  photoHint: { fontSize: 10, color: Colors.textMuted },

  section: { gap: 18 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.sage,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionNote: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
    marginTop: -8,
  },

  inputGroup: { gap: 6 },
  inputLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.blush,
  },
  bioInput: {
    height: 100,
    paddingTop: 13,
  },
  errorText: {
    fontSize: 11,
    color: Colors.blush,
  },

  cta: { paddingTop: 8 },
});
