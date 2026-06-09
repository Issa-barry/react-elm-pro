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
jest.mock('react-native-qrcode-svg', () => {
  const R  = require('react');
  const RN = require('react-native');
  return {
    __esModule: true,
    default: () => R.createElement(RN.View, { testID: 'qrcode' }),
  };
});
jest.mock('../../hooks/useQrPayload', () => ({
  useQrPayload: jest.fn(),
}));

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useQrPayload } from '../../hooks/useQrPayload';

const mockUseCurrentUser = useCurrentUser as jest.Mock;
const mockUseQrPayload   = useQrPayload   as jest.Mock;

const USER_FIXTURE = { id: 'user-42', prenom: 'Moussa', nom: 'CAMARA', telephone: '+224621234567' };
const SITE_FIXTURE = { id: 's1', nom: 'Dépôt Central', code: '001', ville: 'Conakry' };

function setupMocks(overrides?: {
  userLoading?: boolean;
  user?: object | null;
  site?: object | null;
  qrPayload?: string | null;
  qrLoading?: boolean;
}) {
  mockUseCurrentUser.mockReturnValue({
    user:    overrides && 'user' in overrides ? overrides.user : USER_FIXTURE,
    loading: overrides?.userLoading ?? false,
  });
  mockUseQrPayload.mockReturnValue({
    qrPayload: overrides?.qrPayload   ?? null,
    site:      overrides && 'site' in overrides ? overrides.site : null,
    loading:   overrides?.qrLoading   ?? false,
    load:      jest.fn(),
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

  it('affiche "Back-office" quand aucun site n\'est associé', () => {
    render(<AccueilScreen />);
    expect(screen.getByText('Back-office')).toBeTruthy();
  });

  it('affiche le nom du site quand il est disponible', () => {
    setupMocks({ site: SITE_FIXTURE });
    render(<AccueilScreen />);
    expect(screen.getByText('Dépôt Central')).toBeTruthy();
  });

  it('affiche le QR code', () => {
    render(<AccueilScreen />);
    expect(screen.getByTestId('qrcode')).toBeTruthy();
  });

  it('affiche le dashboard stats', () => {
    render(<AccueilScreen />);
    expect(screen.getByTestId('dashboard-stats')).toBeTruthy();
  });
});
