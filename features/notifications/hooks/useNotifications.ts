import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  fetchNotifications,
  markAllRead as apiMarkAllRead,
  markOneRead as apiMarkOneRead,
  type AppNotification,
} from '../services/notifications-api.service';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNotifications();
      setNotifications(res.data);
      setUnreadCount(res.unread_count);
    } catch {
      setError('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    await apiMarkAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    setUnreadCount(0);
  }, []);

  const markOneRead = useCallback(async (id: string) => {
    await apiMarkOneRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, lu: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Recharge quand l'app revient au premier plan
  useEffect(() => {
    load();
    const sub = AppState.addEventListener('change', next => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        load();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [load]);

  return { notifications, unreadCount, loading, error, load, markAllRead, markOneRead };
}
