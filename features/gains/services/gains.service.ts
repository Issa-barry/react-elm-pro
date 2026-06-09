import { secureStorage } from '@/features/auth/services/secure-storage.service';
import type { ApiResult } from '@/features/auth/types/auth.types';
import type { GainsMine } from '../types/gains.types';

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
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: 'Connexion impossible. Vérifiez votre réseau.' };
  }
}

const MOCK_GAINS: GainsMine = {
  total_brut: 351_000,
  total_net: 351_000,
  total_verse: 71_000,
  total_restant: 280_000,
  nb_commandes: 2,
  par_vehicule: [
    { vehicule_id: 'mock-1', nom: 'Baba Ousou',  immatriculation: 'VN-001-GN', total_brut: 81_000,  total_net: 81_000,  total_verse: 0,      total_restant: 81_000,  nb_commandes: 1 },
    { vehicule_id: 'mock-2', nom: 'Nen Dow',     immatriculation: 'RC-001-GN', total_brut: 270_000, total_net: 270_000, total_verse: 71_000, total_restant: 199_000, nb_commandes: 1 },
  ],
};

export const gainsService = {
  async getMesGains(): Promise<ApiResult<GainsMine>> {
    if (USE_MOCK) {
      await new Promise<void>(r => setTimeout(r, 800));
      return { ok: true, data: MOCK_GAINS };
    }
    return authGet<GainsMine>('/api/gains/mine');
  },
};
