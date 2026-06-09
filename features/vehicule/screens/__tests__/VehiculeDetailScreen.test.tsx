import React from 'react';
import { render, screen } from '@testing-library/react-native';
import VehiculeDetailScreen from '../VehiculeDetailScreen';
import { useCommissionsVehicule } from '../../hooks/useCommissionsVehicule';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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
      light: { text: '#020617', background: '#ffffff', tint: '#2563eb', icon: '#64748b', tabIconDefault: '#94a3b8', tabIconSelected: '#2563eb' },
    },
    isDark: false,
  }),
}));

jest.mock('../../hooks/useCommissionsVehicule');

const mockUseCommissions = useCommissionsVehicule as jest.MockedFunction<typeof useCommissionsVehicule>;

const BASE_STATE = {
  commissions: [], loading: false, refreshing: false, error: null,
  load: jest.fn(), refetch: jest.fn(),
};

const PROPS = { id: 'v1', nom: 'Nen Dow', immatriculation: 'RC-001-GN' };

describe('VehiculeDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCommissions.mockReturnValue(BASE_STATE);
  });

  it('affiche le nom et l\'immatriculation du véhicule', () => {
    render(<VehiculeDetailScreen {...PROPS} />);
    expect(screen.getByText('Nen Dow')).toBeTruthy();
    expect(screen.getByText('RC-001-GN')).toBeTruthy();
  });

  it('affiche les chips de filtres', () => {
    render(<VehiculeDetailScreen {...PROPS} />);
    expect(screen.getByText('Tous')).toBeTruthy();
    expect(screen.getByText('Payé')).toBeTruthy();
    expect(screen.getByText('En attente')).toBeTruthy();
  });

  it('affiche un spinner quand loading=true', () => {
    mockUseCommissions.mockReturnValue({ ...BASE_STATE, loading: true });
    const { toJSON } = render(<VehiculeDetailScreen {...PROPS} />);
    expect(toJSON()).toBeTruthy();
  });

  it('affiche un message d\'erreur quand error est défini', () => {
    mockUseCommissions.mockReturnValue({ ...BASE_STATE, error: 'Session expirée.' });
    render(<VehiculeDetailScreen {...PROPS} />);
    expect(screen.getByText('Session expirée.')).toBeTruthy();
  });

  it('affiche le nombre de commandes à 0 par défaut', () => {
    render(<VehiculeDetailScreen {...PROPS} />);
    expect(screen.getByText('Commandes')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });
});
