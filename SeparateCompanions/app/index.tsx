// ─── Root index — redirect based on auth state ────────────────────────────────
// Decides whether to send the user to onboarding or the main app.

import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { isOnboarded, isLoggedIn } = useAuthStore();

  if (isLoggedIn && isOnboarded) {
    return <Redirect href="/(tabs)/discover" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
