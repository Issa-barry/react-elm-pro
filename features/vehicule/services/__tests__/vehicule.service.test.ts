jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue(null) },
}));

import { vehiculeService } from '../vehicule.service';

describe('vehiculeService – mode mock', () => {
  it('retourne les véhicules mock', async () => {
    const result = await vehiculeService.getMesVehicules();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].nom).toBe('Nen Dow');
      expect(result.data[1].nom).toBe('Baba Ousou');
    }
  });
});

describe('vehiculeService – mode API', () => {
  let svc: typeof vehiculeService;

  beforeAll(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
    jest.resetModules();
    jest.doMock('@/features/auth/services/secure-storage.service', () => ({
      secureStorage: { getToken: jest.fn().mockResolvedValue('tok') },
    }));
    svc = require('../vehicule.service').vehiculeService;
  });

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.resetModules();
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('appelle /api/v1/mobile/vehicules/mine', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, json: async () => [],
    });
    await svc.getMesVehicules();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/mobile/vehicules/mine',
      expect.any(Object)
    );
  });

  it('retourne ok:false sur 401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 401, json: async () => ({}),
    });
    const result = await svc.getMesVehicules();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Session expirée. Reconnectez-vous.');
  });

  it('retourne ok:false sur erreur serveur avec message', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 422, json: async () => ({ message: 'Non autorisé.' }),
    });
    const result = await svc.getMesVehicules();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Non autorisé.');
  });

  it('retourne ok:false sur exception fetch', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('No network'));
    const result = await svc.getMesVehicules();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Connexion impossible. Vérifiez votre réseau.');
  });

  it('retourne les données depuis json.data si disponible', async () => {
    const vehicule = { id: '1', nom: 'Test', immatriculation: 'T-001', type: 'Camion', capacite: 100, is_active: true, photo_url: null, role: 'proprietaire', en_livraison: false };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, json: async () => ({ data: [vehicule] }),
    });
    const result = await svc.getMesVehicules();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data[0].nom).toBe('Test');
  });
});
