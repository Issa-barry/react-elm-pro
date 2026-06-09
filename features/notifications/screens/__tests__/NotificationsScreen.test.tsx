jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@/shared/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#2563eb', primaryLight: '#dbeafe', primaryDark: '#1d4ed8',
      background: '#e8edf5', surface: '#ffffff', surfaceAlt: '#f8fafc', cardActive: '#eff6ff',
      text: '#020617', textMuted: '#64748b', textLight: '#94a3b8',
      border: '#e2e8f0', borderLight: '#f1f5f9',
      danger: '#ef4444', warning: '#f59e0b', success: '#22c55e',
      dangerBg: '#fee2e2', warningBg: '#fef9c3', successBg: '#dcfce7', infoBg: '#eff6ff',
      primaryFg: '#ffffff', headerBg: '#2563eb', headerFg: '#ffffff',
      tabActive: '#2563eb', tabInactive: '#94a3b8',
    },
    isDark: false,
  }),
}));

jest.mock('../../hooks/useNotifications');

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import NotificationsScreen from '../NotificationsScreen';
import { useNotifications } from '../../hooks/useNotifications';

const mockUseNotifications = useNotifications as jest.MockedFunction<typeof useNotifications>;

const BASE_STATE = {
  notifications: [],
  unreadCount:   0,
  loading:       false,
  error:         null,
  load:          jest.fn(),
  markAllRead:   jest.fn(),
  markOneRead:   jest.fn(),
};

describe('NotificationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotifications.mockReturnValue(BASE_STATE);
  });

  it('affiche le titre "Alertes"', () => {
    render(<NotificationsScreen />);
    expect(screen.getByText('Alertes')).toBeTruthy();
  });

  it('affiche un spinner quand loading=true et aucune notification', () => {
    mockUseNotifications.mockReturnValue({ ...BASE_STATE, loading: true });
    const { toJSON } = render(<NotificationsScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('affiche "Aucune notification" quand la liste est vide et pas d\'erreur', () => {
    render(<NotificationsScreen />);
    expect(screen.getByText('Aucune notification')).toBeTruthy();
  });

  it('affiche le message d\'erreur à la place de "Aucune notification"', () => {
    mockUseNotifications.mockReturnValue({ ...BASE_STATE, error: 'Connexion impossible' });
    render(<NotificationsScreen />);
    expect(screen.getByText('Connexion impossible')).toBeTruthy();
  });

  it('affiche "Tout lire" quand il y a des notifications non lues', () => {
    mockUseNotifications.mockReturnValue({ ...BASE_STATE, unreadCount: 3 });
    render(<NotificationsScreen />);
    expect(screen.getByText('Tout lire')).toBeTruthy();
  });

  it('affiche les notifications dans la liste', () => {
    const notifications = [
      {
        id: '1', type: null, titre: 'Paiement reçu', message: 'Vous avez reçu 50 000 GNF',
        data: {}, lu: false, created_at: '2026-06-01T10:00:00Z',
      },
    ];
    mockUseNotifications.mockReturnValue({ ...BASE_STATE, notifications, unreadCount: 1 });
    render(<NotificationsScreen />);
    expect(screen.getByText('Paiement reçu')).toBeTruthy();
  });

  it('appelle markOneRead quand on presse une notification non lue', () => {
    const mockMarkOneRead = jest.fn();
    const notifications = [
      {
        id: '1', type: null, titre: 'Nouvelle commande', message: 'Commande #VT-001',
        data: {}, lu: false, created_at: '2026-06-01T10:00:00Z',
      },
    ];
    mockUseNotifications.mockReturnValue({
      ...BASE_STATE,
      notifications,
      unreadCount: 1,
      markOneRead: mockMarkOneRead,
    });
    render(<NotificationsScreen />);
    fireEvent.press(screen.getByText('Nouvelle commande'));
    expect(mockMarkOneRead).toHaveBeenCalledWith('1');
  });
});
