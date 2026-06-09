import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { secureStorage } from '@/features/auth/services/secure-storage.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

function resolveProjectId(): string | undefined {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants?.easConfig as { projectId?: string } | undefined)?.projectId ??
    // Dans Expo Go, l'ID peut être exposé dans le manifest
    (Constants?.manifest2 as Record<string, unknown> | undefined)
      ?.extra as string | undefined
  );
}

export async function registerPushNotifications(): Promise<void> {
  if (!Device.isDevice) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('livraisons', {
      name: 'Livraisons',
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

  const projectId = resolveProjectId();

  if (!projectId) {
    // Pas bloquant — les push seront activés dès que eas init est fait
    console.warn('[Push] projectId introuvable. Lancez: npx eas init');
    return;
  }

  let token: string;
  try {
    const result = await Notifications.getExpoPushTokenAsync({ projectId });
    token = result.data;
  } catch (err) {
    // warn et non error pour ne pas déclencher l'overlay rouge Expo Go
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
