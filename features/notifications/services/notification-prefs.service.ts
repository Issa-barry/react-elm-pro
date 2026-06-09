import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@elm:notification_prefs';

export interface NotificationPrefs {
  pushEnabled: boolean;
  emailEnabled: boolean;
  paiementRecu: boolean;
  creationCommande: boolean;
  nouvelleDepense: boolean;
}

export const DEFAULT_PREFS: NotificationPrefs = {
  pushEnabled:      true,
  emailEnabled:     true,
  paiementRecu:     true,
  creationCommande: true,
  nouvelleDepense:  false,
};

export async function loadNotifPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export async function saveNotifPrefs(prefs: NotificationPrefs): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}
