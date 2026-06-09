jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue(null) },
}));

import { fraisService } from '../frais.service';

describe('fraisService – mode mock', () => {
  it('retourne les frais mock', async () => {
    const result = await fraisService.getFraisVehicule('v1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('f1');
      expect(result.data[0].type_code).toBe('carburant');
    }
  });
});

describe('fraisService – mode API', () => {
  let svc: typeof fraisService;

  beforeAll(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
    jest.resetModules();
    jest.doMock('@/features/auth/services/secure-storage.service', () => ({
      secureStorage: { getToken: jest.fn().mockResolvedValue('tok') },
    }));
    svc = require('../frais.service').fraisService;
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
    await svc.getFraisVehicule('vehicule-7');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/mobile/vehicules/vehicule-7/frais',
      expect.any(Object)
    );
  });

  it('retourne ok:false sur 401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 401, json: async () => ({}),
    });
    const result = await svc.getFraisVehicule('v1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Session expirée. Reconnectez-vous.');
  });

  it('retourne ok:false sur erreur serveur sans message', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 503, json: async () => ({}),
    });
    const result = await svc.getFraisVehicule('v1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Erreur serveur.');
  });

  it('retourne ok:false sur erreur réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('timeout'));
    const result = await svc.getFraisVehicule('v1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Connexion impossible. Vérifiez votre réseau.');
  });
});
