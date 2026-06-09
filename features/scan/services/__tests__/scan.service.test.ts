jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue(null) },
}));

import { scanService } from '../scan.service';

// ── Mode MOCK (pas de BASE_URL) ──────────────────────────────────────────────
describe('scanService – mode mock', () => {
  it('retourne un résultat user pour un QR utilisateur', async () => {
    jest.useFakeTimers();
    const promise = scanService.scan('mock-user-id');
    jest.advanceTimersByTime(1000);
    const result = await promise;
    jest.useRealTimers();

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.type).toBe('user');
  });

  it('retourne un résultat client pour un QR CLI-xxxx', async () => {
    jest.useFakeTimers();
    const promise = scanService.scan('CLI-20260601-0001');
    jest.advanceTimersByTime(1000);
    const result = await promise;
    jest.useRealTimers();

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.type).toBe('client');
  });

  it('retourne un résultat livraison pour un QR VT-xxxx', async () => {
    jest.useFakeTimers();
    const promise = scanService.scan('VT-00001-ABC');
    jest.advanceTimersByTime(1000);
    const result = await promise;
    jest.useRealTimers();

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.type).toBe('livraison');
  });

  it('retourne type=livraison pour un QR TR-xxxx (transfert)', async () => {
    jest.useFakeTimers();
    const promise = scanService.scan('TR-00001-XYZ');
    jest.advanceTimersByTime(1000);
    const result = await promise;
    jest.useRealTimers();

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.type).toBe('livraison');
  });
});

// ── Mode API (BASE_URL présent) ──────────────────────────────────────────────
describe('scanService – mode API', () => {
  let svc: typeof scanService;

  beforeAll(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
    jest.resetModules();
    jest.doMock('@/features/auth/services/secure-storage.service', () => ({
      secureStorage: { getToken: jest.fn().mockResolvedValue('tok-scan') },
    }));
    svc = require('../scan.service').scanService;
  });

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.resetModules();
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('appelle /api/v1/mobile/users/scan/<id> pour un QR utilisateur', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, json: async () => ({ user_id: '1', nom_complet: 'Test', nom: 'T', prenom: 'T', phone: null, ville: null, quartier: null, roles: [], vehicules: [] }),
    });

    await svc.scan('user-abc');

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('/api/v1/mobile/users/scan/');
  });

  it('appelle /api/v1/mobile/clients/scan/<ref> pour un QR CLI-', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, json: async () => ({ id: '1', reference: 'CLI-001', nom_complet: 'A', nom: 'A', prenom: null, raison_sociale: null, phone: null, email: null, ville: null, quartier: null, adresse: null, is_active: true }),
    });

    await svc.scan('CLI-001');

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('/api/v1/mobile/clients/scan/');
  });

  it('appelle /api/v1/mobile/livraisons/scan/<ref> pour un QR VT-', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, json: async () => ({ data: { type: 'commande', reference: 'VT-001', statut: 'en_cours', statut_label: 'En cours' } }),
    });

    await svc.scan('VT-001');

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('/api/v1/mobile/livraisons/scan/');
  });

  it('retourne ok:false sur 401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 401, json: async () => ({}),
    });

    const result = await svc.scan('some-qr');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Session expirée. Reconnectez-vous.');
  });

  it('retourne ok:false sur erreur réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await svc.scan('some-qr');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Connexion impossible. Vérifiez votre réseau.');
  });
});
