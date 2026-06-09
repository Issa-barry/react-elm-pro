jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue(null) },
}));

import { livraisonService } from '../livraison.service';

describe('livraisonService – mode mock', () => {
  it('retourne les données mock (ok: true)', async () => {
    const result = await livraisonService.getLivraisonsEnCours();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('mock-tr-1');
      expect(result.data[0].statut).toBe('transit');
    }
  });
});

describe('livraisonService – mode API (authGet)', () => {
  let svc: typeof livraisonService;

  beforeAll(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
    jest.resetModules();
    jest.doMock('@/features/auth/services/secure-storage.service', () => ({
      secureStorage: { getToken: jest.fn().mockResolvedValue('test-token') },
    }));
    svc = require('../livraison.service').livraisonService;
  });

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.resetModules();
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('appelle la bonne URL avec le header Authorization', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, json: async () => [],
    });
    const result = await svc.getLivraisonsEnCours();
    expect(result.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/livraisons/en-cours',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) })
    );
  });

  it('retourne ok:false avec message sur 401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 401, json: async () => ({}),
    });
    const result = await svc.getLivraisonsEnCours();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Session expirée. Reconnectez-vous.');
  });

  it('retourne ok:false avec message serveur sur erreur non-401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 500, json: async () => ({ message: 'Erreur interne.' }),
    });
    const result = await svc.getLivraisonsEnCours();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Erreur interne.');
  });

  it('retourne ok:false si fetch lève une exception réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    const result = await svc.getLivraisonsEnCours();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Connexion impossible. Vérifiez votre réseau.');
  });

  it('appelle sans Authorization si pas de token', async () => {
    jest.resetModules();
    jest.doMock('@/features/auth/services/secure-storage.service', () => ({
      secureStorage: { getToken: jest.fn().mockResolvedValue(null) },
    }));
    const { livraisonService: svcNoToken } = require('../livraison.service');

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, json: async () => [],
    });
    await svcNoToken.getLivraisonsEnCours();
    const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(callHeaders.Authorization).toBeUndefined();
  });
});
