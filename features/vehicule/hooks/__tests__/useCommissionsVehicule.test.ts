import { act, renderHook } from '@testing-library/react-native';
import { useCommissionsVehicule } from '../useCommissionsVehicule';
import { commissionService } from '../../services/commission.service';
import type { CommissionVehicule } from '../../types/commission.types';

jest.mock('../../services/commission.service');
jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}));

const mockCommissionService = commissionService as jest.Mocked<typeof commissionService>;

const COMMISSION_FIXTURE: CommissionVehicule = {
  id: 'cp-1',
  reference: 'VT-00012-F2Y',
  date: '2026-06-01T10:00:00Z',
  montant_net: 81_000,
  montant_verse: 0,
  montant_restant: 81_000,
  statut: 'en_attente',
  mois: 'Juin 2026',
};

describe('useCommissionsVehicule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── État initial ──────────────────────────────────────────────────────────

  it('démarre avec loading=true et une liste vide', () => {
    mockCommissionService.getCommissionsVehicule.mockResolvedValue({ ok: true, data: [] });
    const { result } = renderHook(() => useCommissionsVehicule('v1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.commissions).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ── load() (via refetch) ──────────────────────────────────────────────────

  it('remplit commissions en cas de succès', async () => {
    mockCommissionService.getCommissionsVehicule.mockResolvedValue({
      ok: true, data: [COMMISSION_FIXTURE],
    });
    const { result } = renderHook(() => useCommissionsVehicule('v1'));

    await act(async () => { await result.current.refetch(); });

    expect(result.current.loading).toBe(false);
    expect(result.current.commissions).toEqual([COMMISSION_FIXTURE]);
    expect(result.current.error).toBeNull();
  });

  it("définit error en cas d'échec", async () => {
    mockCommissionService.getCommissionsVehicule.mockResolvedValue({
      ok: false, error: 'Session expirée. Reconnectez-vous.',
    });
    const { result } = renderHook(() => useCommissionsVehicule('v1'));

    await act(async () => { await result.current.refetch(); });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Session expirée. Reconnectez-vous.');
    expect(result.current.commissions).toEqual([]);
  });

  it('passe loading=true pendant la requête', async () => {
    let resolve!: (v: any) => void;
    mockCommissionService.getCommissionsVehicule.mockReturnValue(new Promise(r => { resolve = r; }));
    const { result } = renderHook(() => useCommissionsVehicule('v1'));

    act(() => { result.current.refetch(); });
    expect(result.current.loading).toBe(true);

    await act(async () => { resolve({ ok: true, data: [] }); });
    expect(result.current.loading).toBe(false);
  });

  it('transmet vehiculeId au service', async () => {
    mockCommissionService.getCommissionsVehicule.mockResolvedValue({ ok: true, data: [] });
    const { result } = renderHook(() => useCommissionsVehicule('vehicule-42'));

    await act(async () => { await result.current.refetch(); });

    expect(mockCommissionService.getCommissionsVehicule).toHaveBeenCalledWith('vehicule-42');
  });
});
