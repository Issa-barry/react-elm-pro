import { secureStorage } from '@/features/auth/services/secure-storage.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export interface AppNotification {
  id: string;
  type: string | null;
  titre: string | null;
  message: string | null;
  data: Record<string, unknown>;
  lu: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  data: AppNotification[];
  unread_count: number;
}

async function headers(): Promise<Record<string, string>> {
  const token = await secureStorage.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await fetch(`${API_URL}/api/v1/mobile/notifications`, {
    headers: await headers(),
  });
  if (!res.ok) throw new Error('Erreur chargement notifications');
  return res.json();
}

export async function markAllRead(): Promise<void> {
  await fetch(`${API_URL}/api/v1/mobile/notifications/mark-all-read`, {
    method: 'POST',
    headers: await headers(),
  });
}

export async function markOneRead(id: string): Promise<void> {
  await fetch(`${API_URL}/api/v1/mobile/notifications/${id}/read`, {
    method: 'POST',
    headers: await headers(),
  });
}
