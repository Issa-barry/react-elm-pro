import { secureStorage } from '@/features/auth/services/secure-storage.service';
import type { ApiResult } from '@/features/auth/types/auth.types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const accueilService = {
  async getQrPayload(): Promise<ApiResult<string | null>> {
    const token = await secureStorage.getToken();
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return { ok: false, error: 'Impossible de récupérer le QR code.' };
      const json = await res.json();
      return { ok: true, data: (json.qr_payload as string | null) ?? null };
    } catch {
      return { ok: false, error: 'Connexion impossible.' };
    }
  },
};
