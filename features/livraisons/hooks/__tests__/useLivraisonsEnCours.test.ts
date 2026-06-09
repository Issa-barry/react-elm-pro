import { act, renderHook } from '@testing-library/react-native';
import { useLivraisonsEnCours } from '../useLivraisonsEnCours';
import { livraisonService } from '../../services/livraison.service';
import type { LivraisonEnCours } from '../../types/livraison.types';

jest.mock('../../services/livraison.service');

const mockLivraisonService = livraisonService as jest.Mocked<typeof livraisonService>;

const LIVRAISON_FIXTURE: LivraisonEnCours = {
  id: 'LIV-001',
  reference: 'LIV-20260601-001',
  statut: 'transit',
  statut_label: 'En transit',
  site_source: 'Conakry',
  site_destination: 'Kindia',
  vehicule: { nom: 'Nen Dow', immatriculation: 'RC-001-GN', type: 'Camion', photo_url: null },
  equipe_nom: 'Équipe A',
  date_depart: '2026-06-01',
  date_arrivee_prevue: '2026-06-03',
  nb_packs: 120,
};

describe('useLivraisonsEnCours', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── État initial ──────────────────────────────────────────────────────────

  it('démarre avec loading=true et une liste vide', () => {
    mockLivraisonService.getLivraisonsEnCours.mockResolvedValue({ ok: true, data: [] });
    const { result } = renderHook(() => useLivraisonsEnCours());

    expect(result.current.loading).toBe(true);
    expect(result.current.livraisons).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ── load() ────────────────────────────────────────────────────────────────

  it('load() remplit livraisons en cas de succès', async () => {
    mockLivraisonService.getLivraisonsEnCours.mockResolvedValue({ ok: true, data: [LIVRAISON_FIXTURE] });
    const { result } = renderHook(() => useLivraisonsEnCours());

    await act(async () => { await result.current.load(); });

    expect(result.current.loading).toBe(false);
    expect(result.current.livraisons).toEqual([LIVRAISON_FIXTURE]);
    expect(result.current.error).toBeNull();
  });

  it("load() définit error en cas d'échec", async () => {
    mockLivraisonService.getLivraisonsEnCours.mockResolvedValue({ ok: false, error: 'Session expirée. Reconnectez-vous.' });
    const { result } = renderHook(() => useLivraisonsEnCours());

    await act(async () => { await result.current.load(); });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Session expirée. Reconnectez-vous.');
    expect(result.current.livraisons).toEqual([]);
  });

  it('load() réinitialise error avant la requête', async () => {
    mockLivraisonService.getLivraisonsEnCours
      .mockResolvedValueOnce({ ok: false, error: 'Erreur réseau.' })
      .mockResolvedValueOnce({ ok: true, data: [LIVRAISON_FIXTURE] });

    const { result } = renderHook(() => useLivraisonsEnCours());
    await act(async () => { await result.current.load(); });
    expect(result.current.error).toBe('Erreur réseau.');

    await act(async () => { await result.current.load(); });
    expect(result.current.error).toBeNull();
    expect(result.current.livraisons).toEqual([LIVRAISON_FIXTURE]);
  });

  // ── refetch() ────────────────────────────────────────────────────────────

  it('refetch() passe refreshing=true sans vider la liste', async () => {
    mockLivraisonService.getLivraisonsEnCours.mockResolvedValueOnce({ ok: true, data: [LIVRAISON_FIXTURE] });
    const { result } = renderHook(() => useLivraisonsEnCours());
    await act(async () => { await result.current.load(); });

    let resolve!: (v: any) => void;
    mockLivraisonService.getLivraisonsEnCours.mockReturnValue(new Promise(r => { resolve = r; }));
    act(() => { result.current.refetch(); });

    expect(result.current.refreshing).toBe(true);
    expect(result.current.livraisons).toEqual([LIVRAISON_FIXTURE]);

    await act(async () => { resolve({ ok: true, data: [] }); });
    expect(result.current.refreshing).toBe(false);
  });

  it('refetch() met à jour livraisons après succès', async () => {
    const l2: LivraisonEnCours = { ...LIVRAISON_FIXTURE, id: 'LIV-002', reference: 'LIV-20260602-001' };
    mockLivraisonService.getLivraisonsEnCours
      .mockResolvedValueOnce({ ok: true, data: [LIVRAISON_FIXTURE] })
      .mockResolvedValueOnce({ ok: true, data: [LIVRAISON_FIXTURE, l2] });

    const { result } = renderHook(() => useLivraisonsEnCours());
    await act(async () => { await result.current.load(); });
    await act(async () => { await result.current.refetch(); });

    expect(result.current.livraisons).toHaveLength(2);
  });

  // ── Données avec véhicule null ────────────────────────────────────────────

  it('gère une livraison sans véhicule (vehicule: null)', async () => {
    const sansVehicule: LivraisonEnCours = { ...LIVRAISON_FIXTURE, vehicule: null };
    mockLivraisonService.getLivraisonsEnCours.mockResolvedValue({ ok: true, data: [sansVehicule] });
    const { result } = renderHook(() => useLivraisonsEnCours());

    await act(async () => { await result.current.load(); });

    expect(result.current.livraisons[0].vehicule).toBeNull();
  });

  it('gère une livraison sans date de départ', async () => {
    const sansDates: LivraisonEnCours = { ...LIVRAISON_FIXTURE, date_depart: null, date_arrivee_prevue: null };
    mockLivraisonService.getLivraisonsEnCours.mockResolvedValue({ ok: true, data: [sansDates] });
    const { result } = renderHook(() => useLivraisonsEnCours());

    await act(async () => { await result.current.load(); });

    expect(result.current.livraisons[0].date_depart).toBeNull();
    expect(result.current.livraisons[0].date_arrivee_prevue).toBeNull();
  });
});
