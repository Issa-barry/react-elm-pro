jest.mock('../../services/accueil.service', () => ({
  accueilService: {
    getAccueilData: jest.fn(),
    getCached:      jest.fn(),
  },
}));

import { renderHook, act } from '@testing-library/react-native';
import { useQrPayload } from '../useQrPayload';
import { accueilService } from '../../services/accueil.service';

const mockGetAccueilData = accueilService.getAccueilData as jest.MockedFunction<typeof accueilService.getAccueilData>;
const mockGetCached      = accueilService.getCached      as jest.MockedFunction<typeof accueilService.getCached>;

const SITE = { id: 's1', nom: 'Dépôt Central', code: '001', ville: 'Conakry' };

describe('useQrPayload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCached.mockResolvedValue(null); // par défaut : pas de cache
  });

  it('état initial: loading=true, qrPayload=null, site=null', () => {
    mockGetAccueilData.mockResolvedValue({ ok: true, data: { qr_payload: null, site: null } });
    const { result } = renderHook(() => useQrPayload());
    expect(result.current.loading).toBe(true);
    expect(result.current.qrPayload).toBeNull();
    expect(result.current.site).toBeNull();
  });

  it('charge qrPayload et site depuis l\'API (sans cache)', async () => {
    mockGetAccueilData.mockResolvedValue({
      ok: true,
      data: { qr_payload: 'user-ulid-123', site: SITE },
    });
    const { result } = renderHook(() => useQrPayload());
    await act(async () => { await result.current.load(); });
    expect(result.current.loading).toBe(false);
    expect(result.current.qrPayload).toBe('user-ulid-123');
    expect(result.current.site?.nom).toBe('Dépôt Central');
  });

  it('affiche le cache immédiatement puis la réponse API', async () => {
    mockGetCached.mockResolvedValue({ qr_payload: 'cached-ulid', site: SITE });
    mockGetAccueilData.mockResolvedValue({
      ok: true,
      data: { qr_payload: 'fresh-ulid', site: SITE },
    });
    const { result } = renderHook(() => useQrPayload());
    await act(async () => { await result.current.load(); });
    // À la fin l'API a écrasé le cache
    expect(result.current.qrPayload).toBe('fresh-ulid');
    expect(result.current.loading).toBe(false);
  });

  it('garde le cache si l\'API échoue', async () => {
    mockGetCached.mockResolvedValue({ qr_payload: 'cached-ulid', site: SITE });
    mockGetAccueilData.mockResolvedValue({ ok: false, error: 'Connexion impossible.' });
    const { result } = renderHook(() => useQrPayload());
    await act(async () => { await result.current.load(); });
    expect(result.current.loading).toBe(false);
    expect(result.current.qrPayload).toBe('cached-ulid');
    expect(result.current.site?.nom).toBe('Dépôt Central');
  });

  it('qrPayload=null et site=null si le service retourne des données vides', async () => {
    mockGetAccueilData.mockResolvedValue({
      ok: true,
      data: { qr_payload: null, site: null },
    });
    const { result } = renderHook(() => useQrPayload());
    await act(async () => { await result.current.load(); });
    expect(result.current.loading).toBe(false);
    expect(result.current.qrPayload).toBeNull();
    expect(result.current.site).toBeNull();
  });

  it('loading=false et valeurs null si pas de cache et service échoue', async () => {
    mockGetAccueilData.mockResolvedValue({ ok: false, error: 'Connexion impossible.' });
    const { result } = renderHook(() => useQrPayload());
    await act(async () => { await result.current.load(); });
    expect(result.current.loading).toBe(false);
    expect(result.current.qrPayload).toBeNull();
    expect(result.current.site).toBeNull();
  });
});
