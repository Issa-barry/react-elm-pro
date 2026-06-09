jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue('tok-test') },
}));

import { accueilService } from '../accueil.service';

const SITE = { id: 's1', nom: 'Dépôt Central', code: '001', ville: 'Conakry' };

describe('accueilService.getAccueilData', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('retourne qr_payload et site depuis l\'API', async () => {
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
  });

  it('retourne ok:false sur erreur réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    const result = await accueilService.getAccueilData();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Connexion impossible.');
  });
});
