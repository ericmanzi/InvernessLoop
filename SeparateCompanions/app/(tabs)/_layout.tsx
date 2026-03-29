// ─── Tab navigator layout ─────────────────────────────────────────────────────
// Bottom tab bar with subtle indicators — no red badges.

import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

interface TabIconProps {
  label: string;
  emoji: string;
  focused: boolean;
}

function TabIcon({ label, emoji, focused }: TabIconProps) {
  return (
    <View style={[tabStyles.container, focused && tabStyles.focused]}>
      <Text style={tabStyles.emoji}>{emoji}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 2,
    minWidth: 64,
  },
  focused: {
    backgroundColor: `${Colors.sage}18`,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  labelFocused: {
    color: Colors.sage,
    fontWeight: '600',
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.navyDark,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Discover" emoji="🧭" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Matches" emoji="✉️" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="We Time" emoji="🗓" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profile" emoji="○" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
