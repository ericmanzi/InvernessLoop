import { Stack } from 'expo-router';
import { Colors } from '../../utils/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.navy },
        animation: 'slide_from_right',
      }}
    />
  );
}
