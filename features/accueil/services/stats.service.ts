import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from '@/features/auth/services/secure-storage.service';
import type { ApiResult } from '@/features/auth/types/auth.types';

const BASE_URL  = process.env.EXPO_PUBLIC_API_URL ?? '';
const CACHE_KEY = '@elm:accueil_stats';

export interface AccueilStats {
  total_factures:  number;
  nb_total:        number;
  factures_payees: number;
  nb_payees:       number;
  reste_encaisser: number;
  nb_impayees:     number;
  nb_annulees:     number;
}

export const statsService = {
  async getCached(): Promise<AccueilStats | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as AccueilStats) : null;
    } catch {
      return null;
    }
  },

  async getStats(): Promise<ApiResult<AccueilStats>> {
    const token = await secureStorage.getToken();
    try {
      const res = await fetch(`${BASE_URL}/api/v1/backoffice/stats`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return { ok: false, error: 'Impossible de récupérer les statistiques.' };
      const data = (await res.json()) as AccueilStats;
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      return { ok: true, data };
    } catch {
      return { ok: false, error: 'Connexion impossible.' };
    }
  },
};
