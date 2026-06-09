import { secureStorage } from '@/features/auth/services/secure-storage.service';
import type { ApiResult } from '@/features/auth/types/auth.types';
import type { FraisApi } from '../types/frais.types';

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

const MOCK: FraisApi[] = [
  { id: 'f1', date: '2026-06-01', montant: 50_000, type_code: 'carburant', type_label: 'Carburant', statut: 'approuve', commentaire: null, mois: 'Juin 2026' },
];

export const fraisService = {
  async getFraisVehicule(vehiculeId: string): Promise<ApiResult<FraisApi[]>> {
    if (USE_MOCK) {
      await new Promise<void>(r => setTimeout(r, 600));
      return { ok: true, data: MOCK };
    }
    return authGet<FraisApi[]>(`/api/v1/mobile/vehicules/${vehiculeId}/frais`);
  },
};
