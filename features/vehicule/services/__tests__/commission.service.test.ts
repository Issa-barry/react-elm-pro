jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue(null) },
}));

import { commissionService } from '../commission.service';

describe('commissionService – mode mock', () => {
  it('retourne les commissions mock', async () => {
    const result = await commissionService.getCommissionsVehicule('v1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('cp-1');
      expect(result.data[0].statut).toBe('en_attente');
    }
  });
});

describe('commissionService – mode API', () => {
  let svc: typeof commissionService;

  beforeAll(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
    jest.resetModules();
    jest.doMock('@/features/auth/services/secure-storage.service', () => ({
      secureStorage: { getToken: jest.fn().mockResolvedValue('tok') },
    }));
    svc = require('../commission.service').commissionService;
  });

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.resetModules();
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('appelle la bonne URL avec vehiculeId', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, json: async () => ({ data: [] }),
    });
    await svc.getCommissionsVehicule('vehicule-42');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/mobile/vehicules/vehicule-42/commissions',
      expect.any(Object)
    );
  });

  it('retourne ok:false sur 401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 401, json: async () => ({}),
    });
    const result = await svc.getCommissionsVehicule('v1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Session expirée. Reconnectez-vous.');
  });

  it('retourne ok:false sur erreur serveur', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 500, json: async () => ({ message: 'Erreur.' }),
    });
    const result = await svc.getCommissionsVehicule('v1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Erreur.');
  });

  it('retourne ok:false sur erreur réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('fail'));
    const result = await svc.getCommissionsVehicule('v1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Connexion impossible. Vérifiez votre réseau.');
  });

  it('utilise json.data si présent sinon json directement', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, json: async () => [{ id: 'c1' }],
    });
    const result = await svc.getCommissionsVehicule('v1');
    expect(result.ok).toBe(true);
  });
});
