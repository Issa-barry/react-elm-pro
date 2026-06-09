import {
  DEFAULT_PREFS,
  loadNotifPrefs,
  saveNotifPrefs,
} from '@/features/notifications/services/notification-prefs.service';

// ── Mock AsyncStorage ─────────────────────────────────────────────────────────

const store: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:  jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
  setItem:  jest.fn((key: string, value: string) => { store[key] = value; return Promise.resolve(); }),
  removeItem: jest.fn((key: string) => { delete store[key]; return Promise.resolve(); }),
}));

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
});

describe('loadNotifPrefs', () => {
  it('retourne les préférences par défaut si aucune valeur enregistrée', async () => {
    const prefs = await loadNotifPrefs();
    expect(prefs).toEqual(DEFAULT_PREFS);
  });

  it('retourne les préférences sauvegardées', async () => {
    const custom = { ...DEFAULT_PREFS, pushEnabled: false, nouvelleDepense: true };
    store['@elm:notification_prefs'] = JSON.stringify(custom);

    const prefs = await loadNotifPrefs();
    expect(prefs.pushEnabled).toBe(false);
    expect(prefs.nouvelleDepense).toBe(true);
  });

  it('fusionne avec les défauts si certaines clés sont manquantes', async () => {
    store['@elm:notification_prefs'] = JSON.stringify({ pushEnabled: false });

    const prefs = await loadNotifPrefs();
    expect(prefs.pushEnabled).toBe(false);
    expect(prefs.emailEnabled).toBe(DEFAULT_PREFS.emailEnabled);
    expect(prefs.paiementRecu).toBe(DEFAULT_PREFS.paiementRecu);
  });

  it('retourne les défauts si le JSON est corrompu', async () => {
    store['@elm:notification_prefs'] = 'invalid-json{{{';
    const prefs = await loadNotifPrefs();
    expect(prefs).toEqual(DEFAULT_PREFS);
  });
});

describe('saveNotifPrefs', () => {
  it('sauvegarde les préférences et les recharge correctement', async () => {
    const custom = { ...DEFAULT_PREFS, pushEnabled: false, creationCommande: false };
    await saveNotifPrefs(custom);

    const loaded = await loadNotifPrefs();
    expect(loaded.pushEnabled).toBe(false);
    expect(loaded.creationCommande).toBe(false);
  });

  it('écrase les préférences précédentes', async () => {
    await saveNotifPrefs({ ...DEFAULT_PREFS, pushEnabled: false });
    await saveNotifPrefs({ ...DEFAULT_PREFS, pushEnabled: true });

    const loaded = await loadNotifPrefs();
    expect(loaded.pushEnabled).toBe(true);
  });
});
