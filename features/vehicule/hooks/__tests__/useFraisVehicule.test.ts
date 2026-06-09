import { act, renderHook } from '@testing-library/react-native';
import { useFraisVehicule } from '../useFraisVehicule';
import { fraisService } from '../../services/frais.service';
import type { FraisApi } from '../../types/frais.types';

jest.mock('../../services/frais.service');

const mockFraisService = fraisService as jest.Mocked<typeof fraisService>;

const FRAIS_FIXTURE: FraisApi = {
  id: 'f1',
  date: '2026-06-01',
  montant: 50_000,
  type_code: 'carburant',
  type_label: 'Carburant',
  statut: 'approuve',
  commentaire: null,
  mois: 'Juin 2026',
};

describe('useFraisVehicule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── État initial ──────────────────────────────────────────────────────────

  it('démarre avec loading=true et une liste vide', () => {
    mockFraisService.getFraisVehicule.mockResolvedValue({ ok: true, data: [] });
    const { result } = renderHook(() => useFraisVehicule('v1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.frais).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ── load() ────────────────────────────────────────────────────────────────

  it('remplit frais en cas de succès', async () => {
    mockFraisService.getFraisVehicule.mockResolvedValue({
      ok: true, data: [FRAIS_FIXTURE],
    });
    const { result } = renderHook(() => useFraisVehicule('v1'));

    await act(async () => { await result.current.load(); });

    expect(result.current.loading).toBe(false);
    expect(result.current.frais).toEqual([FRAIS_FIXTURE]);
    expect(result.current.error).toBeNull();
  });

  it("définit error en cas d'échec", async () => {
    mockFraisService.getFraisVehicule.mockResolvedValue({
      ok: false, error: 'Connexion impossible.',
    });
    const { result } = renderHook(() => useFraisVehicule('v1'));

    await act(async () => { await result.current.load(); });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Connexion impossible.');
    expect(result.current.frais).toEqual([]);
  });

  it('passe loading=true pendant la requête', async () => {
    let resolve!: (v: any) => void;
    mockFraisService.getFraisVehicule.mockReturnValue(new Promise(r => { resolve = r; }));
    const { result } = renderHook(() => useFraisVehicule('v1'));

    act(() => { result.current.load(); });
    expect(result.current.loading).toBe(true);

    await act(async () => { resolve({ ok: true, data: [] }); });
    expect(result.current.loading).toBe(false);
  });

  it('transmet vehiculeId au service', async () => {
    mockFraisService.getFraisVehicule.mockResolvedValue({ ok: true, data: [] });
    const { result } = renderHook(() => useFraisVehicule('vehicule-7'));

    await act(async () => { await result.current.load(); });

    expect(mockFraisService.getFraisVehicule).toHaveBeenCalledWith('vehicule-7');
  });

  it('réinitialise error avant la requête', async () => {
    mockFraisService.getFraisVehicule
      .mockResolvedValueOnce({ ok: false, error: 'Erreur réseau.' })
      .mockResolvedValueOnce({ ok: true, data: [FRAIS_FIXTURE] });

    const { result } = renderHook(() => useFraisVehicule('v1'));
    await act(async () => { await result.current.load(); });
    expect(result.current.error).toBe('Erreur réseau.');

    await act(async () => { await result.current.load(); });
    expect(result.current.error).toBeNull();
    expect(result.current.frais).toEqual([FRAIS_FIXTURE]);
  });
});
