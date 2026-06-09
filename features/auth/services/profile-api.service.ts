import { secureStorage } from './secure-storage.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

async function authHeaders(): Promise<Record<string, string>> {
  const token = await secureStorage.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export async function changePassword(
  payload: ChangePasswordPayload
): Promise<{ ok: boolean; error?: string; fieldErrors?: Record<string, string> }> {
  try {
    const res = await fetch(`${API_URL}/api/v1/mobile/auth/change-password`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const fieldErrors: Record<string, string> = {};
      if (data.errors) {
        for (const [key, msgs] of Object.entries(data.errors)) {
          fieldErrors[key] = (msgs as string[])[0];
        }
      }
      return { ok: false, error: data.message ?? 'Erreur', fieldErrors };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Erreur réseau. Vérifiez votre connexion.' };
  }
}
