import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { AppThemeProvider, useTheme } from '@/shared/contexts/ThemeContext';
import { registerPushNotifications } from '@/features/notifications/services/notification.service';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener     = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerPushNotifications().catch(console.warn);

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Push] Notification reçue:', notification.request.content.title);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Push] Notification touchée:', response.notification.request.content.data);
    });
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <AppThemeProvider>
      <ThemedApp />
    </AppThemeProvider>
  );
}

function ThemedApp() {
  const { isDark, colors } = useTheme();

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card:       colors.surface,
      primary:    colors.primary,
      border:     colors.border,
      text:       colors.text,
    },
  };

  const headerScreenOptions = {
    headerStyle:      { backgroundColor: colors.surface },
    headerTitleStyle: { color: colors.text },
    headerTintColor:  colors.primary,
  };

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={headerScreenOptions}>
        <Stack.Screen name="(auth)"              options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"              options={{ headerShown: false }} />
        <Stack.Screen name="modal"               options={{ presentation: 'modal' }} />
        <Stack.Screen name="scan"                options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="profil/index"         options={{ headerShown: false }} />
        <Stack.Screen name="profil/modifier"      options={{ headerShown: false }} />
        <Stack.Screen name="profil/mot-de-passe"  options={{ headerShown: false }} />
        <Stack.Screen name="profil/notifications" options={{ headerShown: false }} />
        <Stack.Screen name="profil/contact"       options={{ headerShown: false }} />
        <Stack.Screen name="profil/conditions"    options={{ headerShown: false }} />
        <Stack.Screen name="profil/biometrie"     options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
