import { Stack } from 'expo-router';
import { useTheme } from '@/shared/contexts/ThemeContext';
import NotificationsScreen from '@/features/notifications/screens/NotificationsScreen';

export default function NotificationsRoute() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.text },
        }}
      />
      <NotificationsScreen />
    </>
  );
}
