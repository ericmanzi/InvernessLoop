// ─── Space Preferences Display ────────────────────────────────────────────────
// Read-only summary of a user's space preferences — used on profile cards and
// the own-profile screen.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../utils/colors';
import type { SpacePreferences } from '../types';

interface SpacePreferencesProps {
  prefs: SpacePreferences;
  compact?: boolean;
}

// ─── Human-readable labels ────────────────────────────────────────────────────

const TEXTING_LABELS: Record<string, string> = {
  'once-a-day': 'Once a day',
  'few-times-a-week': 'Few times a week',
  'when-inspired': 'When inspired',
};

const RESPONSE_LABELS: Record<string, string> = {
  'within-hours': 'Within hours',
  'within-a-day': 'Within a day',
  'within-a-few-days': 'Within a few days',
};

const IN_PERSON_LABELS: Record<string, string> = {
  'daily': 'Daily',
  'few-times-a-week': 'Few times a week',
  'weekends': 'Weekends',
  'few-times-a-month': 'Few times a month',
};

const SPACE_LABELS: Record<string, string> = {
  'flexible': 'Flexible',
  'some-needed': 'Some space needed',
  'lots-needed': 'Lots of space needed',
};

interface PrefRowProps {
  icon: string;
  label: string;
  value: string;
  compact?: boolean;
}

function PrefRow({ icon, label, value, compact }: PrefRowProps) {
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Text style={styles.icon}>{icon}</Text>
      {!compact && <Text style={styles.label}>{label}</Text>}
      <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>
    </View>
  );
}

export function SpacePreferences({ prefs, compact = false }: SpacePreferencesProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {!compact && (
        <Text style={styles.sectionTitle}>Space Preferences</Text>
      )}
      <PrefRow
        icon="💬"
        label="Texting"
        value={TEXTING_LABELS[prefs.textingFrequency] ?? prefs.textingFrequency}
        compact={compact}
      />
      <PrefRow
        icon="⏱"
        label="Response time"
        value={RESPONSE_LABELS[prefs.responseTimeExpectation] ?? prefs.responseTimeExpectation}
        compact={compact}
      />
      <PrefRow
        icon="🤝"
        label="In person"
        value={IN_PERSON_LABELS[prefs.inPersonFrequency] ?? prefs.inPersonFrequency}
        compact={compact}
      />
      <PrefRow
        icon="🌿"
        label="Personal space"
        value={SPACE_LABELS[prefs.personalSpaceNeed] ?? prefs.personalSpaceNeed}
        compact={compact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  containerCompact: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowCompact: {
    gap: 6,
  },
  icon: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 13,
    color: Colors.sand,
    fontWeight: '500',
  },
  valueCompact: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
