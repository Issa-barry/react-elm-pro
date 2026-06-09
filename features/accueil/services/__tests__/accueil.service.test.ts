jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue('tok-test') },
}));

import { accueilService } from '../accueil.service';

describe('accueilService.getQrPayload', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('retourne le qr_payload depuis l\'API', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ qr_payload: 'abc123' }),
    });
    const result = await accueilService.getQrPayload();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBe('abc123');
  });

  it('retourne null si qr_payload absent de la réponse', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    const result = await accueilService.getQrPayload();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBeNull();
  });

  it('retourne ok:false si la réponse HTTP n\'est pas ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 401, json: async () => ({}),
    });
    const result = await accueilService.getQrPayload();
    expect(result.ok).toBe(false);
  });

  it('retourne ok:false sur erreur réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    const result = await accueilService.getQrPayload();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Connexion impossible.');
  });
});
