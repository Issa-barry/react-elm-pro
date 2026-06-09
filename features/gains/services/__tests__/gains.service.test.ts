jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue(null) },
}));

import { gainsService } from '../gains.service';
import type { GainsMine } from '../../types/gains.types';

// ── Mode MOCK (pas de BASE_URL) ──────────────────────────────────────────────
describe('gainsService – mode mock', () => {
  it('retourne les données mock (ok: true) sans appeler fetch', async () => {
    jest.useFakeTimers();
    const promise = gainsService.getMesGains();
    jest.advanceTimersByTime(1000);
    const result = await promise;
    jest.useRealTimers();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.nb_commandes).toBe(2);
      expect(result.data.par_vehicule).toHaveLength(2);
      expect(result.data.total_brut).toBeGreaterThan(0);
    }
  });
});

// ── Mode API (BASE_URL présent) ──────────────────────────────────────────────
describe('gainsService – mode API', () => {
  let svc: typeof gainsService;

  beforeAll(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
    jest.resetModules();
    jest.doMock('@/features/auth/services/secure-storage.service', () => ({
      secureStorage: { getToken: jest.fn().mockResolvedValue('tok-gains') },
    }));
    svc = require('../gains.service').gainsService;
  });

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.resetModules();
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('appelle /api/gains/mine avec le header Authorization', async () => {
    const mockData: GainsMine = {
      total_brut: 100_000, total_net: 90_000, total_verse: 50_000, total_restant: 40_000,
      nb_commandes: 3, par_vehicule: [],
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, json: async () => mockData,
    });

    const result = await svc.getMesGains();

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/gains/mine',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer tok-gains' }) })
    );
  });

  it('retourne ok:false avec message sur 401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 401, json: async () => ({}),
    });

    const result = await svc.getMesGains();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Session expirée. Reconnectez-vous.');
  });

  it('retourne ok:false avec message serveur sur erreur non-401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 500, json: async () => ({ message: 'Erreur interne.' }),
    });

    const result = await svc.getMesGains();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Erreur interne.');
  });

  it('retourne ok:false si fetch lève une exception réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection refused'));

    const result = await svc.getMesGains();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Connexion impossible. Vérifiez votre réseau.');
  });

  it('appelle sans Authorization si pas de token', async () => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
    jest.doMock('@/features/auth/services/secure-storage.service', () => ({
      secureStorage: { getToken: jest.fn().mockResolvedValue(null) },
    }));
    const svcNoToken = require('../gains.service').gainsService;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, json: async () => ({ total_brut: 0, total_net: 0, total_verse: 0, total_restant: 0, nb_commandes: 0, par_vehicule: [] }),
    });
    await svcNoToken.getMesGains();

    const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(callHeaders.Authorization).toBeUndefined();
  });
});
