import { secureStorage } from '@/features/auth/services/secure-storage.service';
import type { ApiResult } from '@/features/auth/types/auth.types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export interface AccueilData {
  qr_payload: string | null;
  site: { id: string; nom: string; code: string; ville: string | null } | null;
}

export const accueilService = {
  async getAccueilData(): Promise<ApiResult<AccueilData>> {
    const token = await secureStorage.getToken();
    try {
      const res = await fetch(`${BASE_URL}/api/v1/backoffice/me`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return { ok: false, error: 'Impossible de récupérer les données.' };
      const json = await res.json();
      return {
        ok: true,
        data: {
          qr_payload: (json.qr_payload as string | null) ?? null,
          site: (json.site as AccueilData['site']) ?? null,
        },
      };
    } catch {
      return { ok: false, error: 'Connexion impossible.' };
    }
  },
};
