import { secureStorage } from '@/features/auth/services/secure-storage.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export async function envoyerMessage(
  message: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const token = await secureStorage.getToken();
    const res = await fetch(`${API_URL}/api/v1/mobile/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.message ?? 'Une erreur est survenue.' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Erreur réseau. Vérifiez votre connexion.' };
  }
}
