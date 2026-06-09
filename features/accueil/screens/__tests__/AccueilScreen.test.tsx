import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AccueilScreen from '../AccueilScreen';

// ── Mocks des dépendances externes ────────────────────────────────────────────

jest.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn(),
}));
jest.mock('@/features/auth/hooks/useLogout', () => ({
  useLogout: () => ({ logout: jest.fn() }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));
jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  router: { push: jest.fn() },
}));
jest.mock('@/features/notifications/services/notifications-api.service', () => ({
  fetchNotifications: jest.fn().mockResolvedValue({ unread_count: 0 }),
}));
jest.mock('../../components/DashboardStats', () => {
  const { View } = require('react-native');
  return () => <View testID="dashboard-stats" />;
});

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

const mockUseCurrentUser = useCurrentUser as jest.Mock;

const USER_FIXTURE = { id: 'user-42', prenom: 'Moussa', nom: 'CAMARA', telephone: '+224621234567' };

function setupMocks(overrides?: { userLoading?: boolean; user?: object | null }) {
  mockUseCurrentUser.mockReturnValue({
    user: overrides && 'user' in overrides ? overrides.user : USER_FIXTURE,
    loading: overrides?.userLoading ?? false,
  });
}

describe('AccueilScreen — infos utilisateur', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it("affiche le nom complet de l'utilisateur", () => {
    render(<AccueilScreen />);
    expect(screen.getByText('Moussa CAMARA')).toBeTruthy();
  });

  it('affiche le numéro de téléphone formaté', () => {
    render(<AccueilScreen />);
    expect(screen.getByText('+224 621 23 45 67')).toBeTruthy();
  });

  it('affiche le badge Back-office', () => {
    render(<AccueilScreen />);
    expect(screen.getByText('Back-office')).toBeTruthy();
  });

  it('affiche le dashboard stats', () => {
    render(<AccueilScreen />);
    expect(screen.getByTestId('dashboard-stats')).toBeTruthy();
  });
});
