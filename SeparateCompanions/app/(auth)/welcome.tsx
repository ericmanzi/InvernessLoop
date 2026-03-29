// ─── Welcome screen ───────────────────────────────────────────────────────────
// First screen a new user sees. Explains the app concept and routes to sign up.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../utils/colors';

// Value propositions shown on the welcome screen
const VALUE_PROPS = [
  {
    icon: '🌿',
    title: 'Your space, your pace',
    desc: 'Set your own communication rhythm — no pressure, no guilt.',
  },
  {
    icon: '✉️',
    title: 'No pressure messaging',
    desc: 'Quiet Mode and Slow Lane keep conversations on your schedule.',
  },
  {
    icon: '🧭',
    title: 'Matches who get it',
    desc: 'Our Breathing Room score connects you with space-compatible people.',
  },
];

export default function WelcomeScreen() {
  return (
    <LinearGradient colors={[Colors.navyDark, Colors.navy, Colors.navyLight]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* App name + tagline */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>○ ○</Text>
            </View>
            <Text style={styles.appName}>Separate{'\n'}Companions</Text>
            <Text style={styles.tagline}>Connection on your terms</Text>
          </View>

          {/* Value props */}
          <View style={styles.propsSection}>
            {VALUE_PROPS.map((prop, idx) => (
              <View key={idx} style={styles.propCard}>
                <Text style={styles.propIcon}>{prop.icon}</Text>
                <View style={styles.propText}>
                  <Text style={styles.propTitle}>{prop.title}</Text>
                  <Text style={styles.propDesc}>{prop.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA buttons */}
          <View style={styles.ctaSection}>
            <Button
              title="Begin your journey"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => router.push('/(auth)/quiz')}
            />
            <Button
              title="I already have an account"
              variant="ghost"
              size="md"
              fullWidth
              onPress={() => {
                // In a real app this would open a login flow.
                // For the prototype, just go to quiz.
                router.push('/(auth)/quiz');
              }}
            />
            <Text style={styles.disclaimer}>
              By continuing, you agree that this is a space built on mutual respect for independence.
            </Text>
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
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
    gap: 48,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 22,
    color: Colors.sage,
    letterSpacing: 6,
  },
  appName: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.offwhite,
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 17,
    color: Colors.sand,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },

  // Value props
  propsSection: {
    gap: 16,
  },
  propCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: Colors.overlayLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  propIcon: {
    fontSize: 26,
    marginTop: 2,
  },
  propText: { flex: 1, gap: 4 },
  propTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.offwhite,
  },
  propDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // CTA
  ctaSection: {
    gap: 14,
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
    marginTop: 4,
  },
});
