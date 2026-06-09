jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue('tok-test') },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { accueilService } from '../accueil.service';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

const SITE = { id: 's1', nom: 'Dépôt Central', code: '001', ville: 'Conakry' };
const CACHED_DATA = { qr_payload: 'user-ulid-123', site: SITE };

describe('accueilService.getCached', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne les données du cache si présentes', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(CACHED_DATA));
    const result = await accueilService.getCached();
    expect(result?.qr_payload).toBe('user-ulid-123');
    expect(result?.site?.nom).toBe('Dépôt Central');
  });

  it('retourne null si aucun cache', async () => {
    mockGetItem.mockResolvedValue(null);
    expect(await accueilService.getCached()).toBeNull();
  });

  it('retourne null sur erreur AsyncStorage', async () => {
    mockGetItem.mockRejectedValue(new Error('storage error'));
    expect(await accueilService.getCached()).toBeNull();
  });
});

describe('accueilService.getAccueilData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('retourne qr_payload et site depuis l\'API et met en cache', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ qr_payload: 'user-ulid-123', site: SITE }),
    });
    const result = await accueilService.getAccueilData();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.qr_payload).toBe('user-ulid-123');
      expect(result.data.site?.nom).toBe('Dépôt Central');
    }
    expect(mockSetItem).toHaveBeenCalledWith('@elm:accueil_data', expect.any(String));
  });

  it('retourne qr_payload=null et site=null si absents de la réponse', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    const result = await accueilService.getAccueilData();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.qr_payload).toBeNull();
      expect(result.data.site).toBeNull();
    }
  });

  it('retourne ok:false si la réponse HTTP n\'est pas ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 401, json: async () => ({}),
    });
    const result = await accueilService.getAccueilData();
    expect(result.ok).toBe(false);
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it('retourne ok:false sur erreur réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    const result = await accueilService.getAccueilData();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Connexion impossible.');
  });
});
