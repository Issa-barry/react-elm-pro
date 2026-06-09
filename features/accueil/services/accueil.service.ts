import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from '@/features/auth/services/secure-storage.service';
import type { ApiResult } from '@/features/auth/types/auth.types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const CACHE_KEY = '@elm:accueil_data';

export interface AccueilData {
  qr_payload: string | null;
  site: { id: string; nom: string; code: string | null; ville: string | null } | null;
}

export const accueilService = {
  async getCached(): Promise<AccueilData | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as AccueilData) : null;
    } catch {
      return null;
    }
  },

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
      const data: AccueilData = {
        qr_payload: (json.qr_payload as string | null) ?? null,
        site: (json.site as AccueilData['site']) ?? null,
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      return { ok: true, data };
    } catch {
      return { ok: false, error: 'Connexion impossible.' };
    }
  },
};
