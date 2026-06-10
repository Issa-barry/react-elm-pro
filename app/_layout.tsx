import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/features/auth/contexts/AuthContext';
import { registerPushNotifications } from '@/features/notifications/services/notification.service';
import { AppThemeProvider, useTheme } from '@/shared/contexts/ThemeContext';


export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const notificationListener = useRef<{ remove: () => void } | null>(null);
  const responseListener     = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    // expo-notifications push non supporté dans Expo Go depuis SDK 53 — import dynamique
    if (Constants.executionEnvironment === 'storeClient') return;

    let cancelled = false;

    (async () => {
      const Notifications = await import('expo-notifications');
      if (cancelled) return;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      registerPushNotifications().catch(console.warn);

      notificationListener.current = Notifications.addNotificationReceivedListener(n => {
        console.log('[Push] Notification reçue:', n.request.content.title);
      });
      responseListener.current = Notifications.addNotificationResponseReceivedListener(r => {
        console.log('[Push] Notification touchée:', r.notification.request.content.data);
      });
    })();

    return () => {
      cancelled = true;
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
        <Stack.Screen name="produits/[id]"          options={{ headerShown: false }} />
        <Stack.Screen name="produits/create"        options={{ title: 'Nouveau produit' }} />
        <Stack.Screen name="produits/[id]/modifier"   options={{ title: 'Modifier le produit' }} />
        <Stack.Screen name="produits/[id]/historique" options={{ headerShown: false }} />
        <Stack.Screen name="logistique"          options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.surface} />
    </ThemeProvider>
  );
}
