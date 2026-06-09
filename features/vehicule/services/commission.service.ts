import { secureStorage } from '@/features/auth/services/secure-storage.service';
import type { ApiResult } from '@/features/auth/types/auth.types';
import type { CommissionVehicule } from '../types/commission.types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const USE_MOCK = !BASE_URL;

async function authGet<T>(path: string): Promise<ApiResult<T>> {
  const token = await secureStorage.getToken();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await res.json();
    if (res.status === 401) return { ok: false, error: 'Session expirée. Reconnectez-vous.' };
    if (!res.ok) return { ok: false, error: json.message ?? 'Erreur serveur.' };
    return { ok: true, data: (json.data ?? json) as T };
  } catch {
    return { ok: false, error: 'Connexion impossible. Vérifiez votre réseau.' };
  }
}

const MOCK: CommissionVehicule[] = [
  { id: 'cp-1', reference: 'VT-00012-F2Y', date: '2026-06-01T10:00:00Z', montant_net: 81_000, montant_verse: 0,      montant_restant: 81_000,  statut: 'en_attente', mois: 'Juin 2026' },
  { id: 'cp-2', reference: 'VT-00001-6R9', date: '2026-05-19T08:00:00Z', montant_net: 270_000, montant_verse: 71_000, montant_restant: 199_000, statut: 'en_attente', mois: 'Mai 2026'  },
];

export const commissionService = {
  async getCommissionsVehicule(vehiculeId: string): Promise<ApiResult<CommissionVehicule[]>> {
    if (USE_MOCK) {
      await new Promise<void>(r => setTimeout(r, 600));
      return { ok: true, data: MOCK };
    }
    return authGet<CommissionVehicule[]>(`/api/v1/mobile/vehicules/${vehiculeId}/commissions`);
  },
};
