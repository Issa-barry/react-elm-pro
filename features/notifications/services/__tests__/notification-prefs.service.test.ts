jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadNotifPrefs, saveNotifPrefs, DEFAULT_PREFS } from '../notification-prefs.service';

describe('notification-prefs.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('loadNotifPrefs', () => {
    it('retourne DEFAULT_PREFS si AsyncStorage est vide', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await loadNotifPrefs();
      expect(result).toEqual(DEFAULT_PREFS);
    });

    it('retourne les prefs fusionnées avec les défauts', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ pushEnabled: false }));
      const result = await loadNotifPrefs();
      expect(result.pushEnabled).toBe(false);
      expect(result.emailEnabled).toBe(DEFAULT_PREFS.emailEnabled);
      expect(result.paiementRecu).toBe(DEFAULT_PREFS.paiementRecu);
    });

    it('retourne DEFAULT_PREFS si AsyncStorage lève une erreur', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      const result = await loadNotifPrefs();
      expect(result).toEqual(DEFAULT_PREFS);
    });

    it('retourne DEFAULT_PREFS si le JSON est invalide', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('not-json{');
      const result = await loadNotifPrefs();
      expect(result).toEqual(DEFAULT_PREFS);
    });
  });

  describe('saveNotifPrefs', () => {
    it('sauvegarde les prefs dans AsyncStorage', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      const prefs = { ...DEFAULT_PREFS, pushEnabled: false };
      await saveNotifPrefs(prefs);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@elm:notification_prefs',
        JSON.stringify(prefs)
      );
    });
  });
});
