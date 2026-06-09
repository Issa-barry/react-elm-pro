import { act, renderHook } from '@testing-library/react-native';
import { useGainsMine } from '../useGainsMine';
import { gainsService } from '../../services/gains.service';
import type { GainsMine } from '../../types/gains.types';

jest.mock('../../services/gains.service');

const mockGetMesGains = gainsService.getMesGains as jest.MockedFunction<
  typeof gainsService.getMesGains
>;

const GAINS_FIXTURE: GainsMine = {
  total_brut: 351_000,
  total_net: 351_000,
  total_verse: 71_000,
  total_restant: 280_000,
  nb_commandes: 2,
  par_vehicule: [
    { vehicule_id: 'v1', nom: 'Baba Ousou', immatriculation: 'VN-001-GN', total_brut: 81_000, total_net: 81_000, total_verse: 0, total_restant: 81_000, nb_commandes: 1 },
  ],
};

describe('useGainsMine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMesGains.mockResolvedValue({ ok: true, data: GAINS_FIXTURE });
  });

  it('démarre avec loading=true et gains=null', () => {
    const { result } = renderHook(() => useGainsMine());

    expect(result.current.loading).toBe(true);
    expect(result.current.gains).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.refreshing).toBe(false);
  });

  it('load() charge les gains et met loading=false', async () => {
    const { result } = renderHook(() => useGainsMine());

    await act(async () => { await result.current.load(); });

    expect(result.current.loading).toBe(false);
    expect(result.current.gains).toEqual(GAINS_FIXTURE);
    expect(result.current.error).toBeNull();
    expect(mockGetMesGains).toHaveBeenCalledTimes(1);
  });

  it("load() définit error si le service échoue", async () => {
    mockGetMesGains.mockResolvedValue({ ok: false, error: 'Session expirée. Reconnectez-vous.' });
    const { result } = renderHook(() => useGainsMine());

    await act(async () => { await result.current.load(); });

    expect(result.current.loading).toBe(false);
    expect(result.current.gains).toBeNull();
    expect(result.current.error).toBe('Session expirée. Reconnectez-vous.');
  });

  it('refetch() passe refreshing=true puis false', async () => {
    let resolve!: (v: any) => void;
    mockGetMesGains.mockReturnValue(new Promise(r => { resolve = r; }));
    const { result } = renderHook(() => useGainsMine());

    act(() => { result.current.refetch(); });
    expect(result.current.refreshing).toBe(true);

    await act(async () => { resolve({ ok: true, data: GAINS_FIXTURE }); });
    expect(result.current.refreshing).toBe(false);
    expect(result.current.gains).toEqual(GAINS_FIXTURE);
  });

  it("refetch() définit error en cas d'échec", async () => {
    mockGetMesGains.mockResolvedValue({ ok: false, error: 'Connexion impossible. Vérifiez votre réseau.' });
    const { result } = renderHook(() => useGainsMine());

    await act(async () => { await result.current.refetch(); });

    expect(result.current.refreshing).toBe(false);
    expect(result.current.error).toBe('Connexion impossible. Vérifiez votre réseau.');
  });
});
