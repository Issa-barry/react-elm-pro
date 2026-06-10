import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { secureStorage } from '@/features/auth/services/secure-storage.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

// expo-notifications a retiré le support push d'Expo Go depuis SDK 53.
// On importe le module dynamiquement pour que DevicePushTokenAutoRegistration.fx.js
// ne se charge jamais dans Expo Go (l'import statique le déclenche au module-load).
const isExpoGo = Constants.executionEnvironment === 'storeClient';

export async function registerPushNotifications(): Promise<void> {
  if (isExpoGo || !Device.isDevice) return;

  const Notifications = await import('expo-notifications');

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('general', {
      name: 'Général',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants?.easConfig as { projectId?: string } | undefined)?.projectId;

  if (!projectId) {
    console.warn('[Push] projectId introuvable. Lancez: npx eas init');
    return;
  }

  let token: string;
  try {
    const result = await Notifications.getExpoPushTokenAsync({ projectId });
    token = result.data;
  } catch (err) {
    console.warn('[Push] getExpoPushTokenAsync échoué:', err);
    return;
  }

  await sendTokenToBackend(token);
}

async function sendTokenToBackend(token: string): Promise<void> {
  const authToken = await secureStorage.getToken();
  if (!authToken) return;

  try {
    await fetch(`${API_URL}/api/v1/mobile/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ expo_push_token: token }),
    });
  } catch (err) {
    console.warn('[Push] Envoi token backend échoué:', err);
  }
}
