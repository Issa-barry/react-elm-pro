import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/features/auth/contexts/AuthContext';
import { registerPushNotifications } from '@/features/notifications/services/notification.service';
import { AppThemeProvider, useTheme } from '@/shared/contexts/ThemeContext';

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
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </AppThemeProvider>
  );
}

function ThemedApp() {
  const { isDark, colors } = useTheme();
  const { isAuthenticated, ready } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuth) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, ready, segments]);

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
    headerBackTitle:  'Retour',
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
        <Stack.Screen name="ventes"              options={{ headerShown: false }} />
        <Stack.Screen name="vehicules"           options={{ headerShown: false }} />
        <Stack.Screen name="produits"            options={{ headerShown: false }} />
        <Stack.Screen name="produits/[id]"          options={{ title: 'Détail produit' }} />
        <Stack.Screen name="produits/create"        options={{ title: 'Nouveau produit' }} />
        <Stack.Screen name="produits/[id]/modifier"   options={{ title: 'Modifier le produit' }} />
        <Stack.Screen name="produits/[id]/historique" options={{ headerShown: false }} />
        <Stack.Screen name="logistique"          options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
