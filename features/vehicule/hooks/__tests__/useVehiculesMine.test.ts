import { act, renderHook } from '@testing-library/react-native';
import { useVehiculesMine } from '../useVehiculesMine';
import { vehiculeService } from '../../services/vehicule.service';
import type { VehiculeApi } from '../../types/vehicule.types';

jest.mock('../../services/vehicule.service');

const mockVehiculeService = vehiculeService as jest.Mocked<typeof vehiculeService>;

const VEHICULE_FIXTURE: VehiculeApi = {
  id: '1',
  nom: 'Nen Dow',
  immatriculation: 'RC-001-GN',
  type: 'Camion',
  capacite: 500,
  is_active: true,
  photo_url: null,
  role: 'proprietaire',
  en_livraison: false,
};

describe('useVehiculesMine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── État initial ──────────────────────────────────────────────────────────

  it('démarre avec loading=true et une liste vide', () => {
    mockVehiculeService.getMesVehicules.mockResolvedValue({ ok: true, data: [] });
    const { result } = renderHook(() => useVehiculesMine());

    expect(result.current.loading).toBe(true);
    expect(result.current.vehicules).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ── load() ────────────────────────────────────────────────────────────────

  it('load() remplit vehicules et désactive loading en cas de succès', async () => {
    mockVehiculeService.getMesVehicules.mockResolvedValue({ ok: true, data: [VEHICULE_FIXTURE] });
    const { result } = renderHook(() => useVehiculesMine());

    await act(async () => { await result.current.load(); });

    expect(result.current.loading).toBe(false);
    expect(result.current.vehicules).toEqual([VEHICULE_FIXTURE]);
    expect(result.current.error).toBeNull();
  });

  it("load() définit error et désactive loading en cas d'échec", async () => {
    mockVehiculeService.getMesVehicules.mockResolvedValue({ ok: false, error: 'Connexion impossible.' });
    const { result } = renderHook(() => useVehiculesMine());

    await act(async () => { await result.current.load(); });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Connexion impossible.');
    expect(result.current.vehicules).toEqual([]);
  });

  it('load() met loading=true pendant la requête', async () => {
    let resolve!: (v: any) => void;
    mockVehiculeService.getMesVehicules.mockReturnValue(new Promise(r => { resolve = r; }));
    const { result } = renderHook(() => useVehiculesMine());

    act(() => { result.current.load(); });
    expect(result.current.loading).toBe(true);

    await act(async () => { resolve({ ok: true, data: [] }); });
    expect(result.current.loading).toBe(false);
  });

  // ── refetch() ────────────────────────────────────────────────────────────

  it('refetch() passe refreshing=true sans masquer la liste existante', async () => {
    mockVehiculeService.getMesVehicules.mockResolvedValueOnce({ ok: true, data: [VEHICULE_FIXTURE] });
    const { result } = renderHook(() => useVehiculesMine());
    await act(async () => { await result.current.load(); });

    let resolve!: (v: any) => void;
    mockVehiculeService.getMesVehicules.mockReturnValue(new Promise(r => { resolve = r; }));
    act(() => { result.current.refetch(); });

    expect(result.current.refreshing).toBe(true);
    expect(result.current.vehicules).toEqual([VEHICULE_FIXTURE]); // liste toujours visible

    await act(async () => { resolve({ ok: true, data: [] }); });
    expect(result.current.refreshing).toBe(false);
  });

  it('refetch() met à jour vehicules après succès', async () => {
    const v2: VehiculeApi = { ...VEHICULE_FIXTURE, id: '2', nom: 'Baba Ousou' };
    mockVehiculeService.getMesVehicules
      .mockResolvedValueOnce({ ok: true, data: [VEHICULE_FIXTURE] })
      .mockResolvedValueOnce({ ok: true, data: [VEHICULE_FIXTURE, v2] });

    const { result } = renderHook(() => useVehiculesMine());
    await act(async () => { await result.current.load(); });
    await act(async () => { await result.current.refetch(); });

    expect(result.current.vehicules).toHaveLength(2);
  });

  it("refetch() définit error sans effacer la liste en cas d'échec", async () => {
    mockVehiculeService.getMesVehicules
      .mockResolvedValueOnce({ ok: true, data: [VEHICULE_FIXTURE] })
      .mockResolvedValueOnce({ ok: false, error: 'Réseau indisponible.' });

    const { result } = renderHook(() => useVehiculesMine());
    await act(async () => { await result.current.load(); });
    await act(async () => { await result.current.refetch(); });

    expect(result.current.error).toBe('Réseau indisponible.');
    expect(result.current.vehicules).toEqual([VEHICULE_FIXTURE]); // liste conservée
  });
});
