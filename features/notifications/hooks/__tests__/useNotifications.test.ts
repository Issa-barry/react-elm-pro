import { act, renderHook } from '@testing-library/react-native';
import { useNotifications } from '../useNotifications';
import * as api from '../../services/notifications-api.service';
import type { AppNotification } from '../../services/notifications-api.service';

jest.mock('../../services/notifications-api.service');

const mockFetch      = api.fetchNotifications as jest.MockedFunction<typeof api.fetchNotifications>;
const mockMarkAll    = api.markAllRead        as jest.MockedFunction<typeof api.markAllRead>;
const mockMarkOne    = api.markOneRead        as jest.MockedFunction<typeof api.markOneRead>;

const NOTIF: AppNotification = {
  id: 'n1', type: 'livraison', titre: 'Nouvelle livraison',
  message: 'Livraison en attente.', data: {}, lu: false,
  created_at: '2026-06-01T10:00:00Z',
};

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ data: [], unread_count: 0 });
    mockMarkAll.mockResolvedValue(undefined);
    mockMarkOne.mockResolvedValue(undefined);
  });

  it('démarre avec loading=false et listes vides', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('load() charge les notifications et met à jour unreadCount', async () => {
    mockFetch.mockResolvedValue({ data: [NOTIF], unread_count: 1 });
    const { result } = renderHook(() => useNotifications());

    await act(async () => { await result.current.load(); });

    expect(result.current.notifications).toEqual([NOTIF]);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("load() définit error si l'API lève une exception", async () => {
    mockFetch.mockRejectedValue(new Error('Réseau'));
    const { result } = renderHook(() => useNotifications());

    await act(async () => { await result.current.load(); });

    expect(result.current.error).toBe('Impossible de charger les notifications.');
    expect(result.current.loading).toBe(false);
  });

  it('markAllRead() marque toutes les notifs comme lues et remet unreadCount à 0', async () => {
    mockFetch.mockResolvedValue({ data: [NOTIF], unread_count: 1 });
    const { result } = renderHook(() => useNotifications());
    await act(async () => { await result.current.load(); });

    await act(async () => { await result.current.markAllRead(); });

    expect(result.current.notifications[0].lu).toBe(true);
    expect(result.current.unreadCount).toBe(0);
    expect(mockMarkAll).toHaveBeenCalled();
  });

  it('markOneRead() marque uniquement la notif ciblée comme lue', async () => {
    const n2: AppNotification = { ...NOTIF, id: 'n2', lu: false };
    mockFetch.mockResolvedValue({ data: [NOTIF, n2], unread_count: 2 });
    const { result } = renderHook(() => useNotifications());
    await act(async () => { await result.current.load(); });

    await act(async () => { await result.current.markOneRead('n1'); });

    expect(result.current.notifications.find(n => n.id === 'n1')?.lu).toBe(true);
    expect(result.current.notifications.find(n => n.id === 'n2')?.lu).toBe(false);
    expect(result.current.unreadCount).toBe(1);
    expect(mockMarkOne).toHaveBeenCalledWith('n1');
  });

  it('markOneRead() ne descend pas unreadCount en dessous de 0', async () => {
    mockFetch.mockResolvedValue({ data: [{ ...NOTIF, lu: true }], unread_count: 0 });
    const { result } = renderHook(() => useNotifications());
    await act(async () => { await result.current.load(); });

    await act(async () => { await result.current.markOneRead('n1'); });

    expect(result.current.unreadCount).toBe(0);
  });
});
