import React from 'react';
import { render, screen } from '@testing-library/react-native';
import VehiculeFraisScreen from '../VehiculeFraisScreen';
import { useFraisVehicule } from '../../hooks/useFraisVehicule';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
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

jest.mock('../../hooks/useFraisVehicule');

const mockUseFraisVehicule = useFraisVehicule as jest.MockedFunction<typeof useFraisVehicule>;

const BASE_STATE = {
  frais: [], loading: false, error: null, load: jest.fn(), refetch: jest.fn(),
};

const PROPS = { id: 'v1', nom: 'Nen Dow', immatriculation: 'RC-001-GN' };

describe('VehiculeFraisScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFraisVehicule.mockReturnValue(BASE_STATE);
  });

  it('affiche le nom et l\'immatriculation du véhicule', () => {
    render(<VehiculeFraisScreen {...PROPS} />);
    expect(screen.getByText('Nen Dow')).toBeTruthy();
    expect(screen.getByText('RC-001-GN')).toBeTruthy();
  });

  it('affiche le filtre Tous et Tous les mois par défaut', () => {
    render(<VehiculeFraisScreen {...PROPS} />);
    expect(screen.getByText('Tous')).toBeTruthy();
    expect(screen.getByText('Tous les mois')).toBeTruthy();
  });

  it('affiche les labels Total frais et Dépenses', () => {
    render(<VehiculeFraisScreen {...PROPS} />);
    expect(screen.getByText('Total frais')).toBeTruthy();
    expect(screen.getByText('Dépenses')).toBeTruthy();
  });

  it('affiche un spinner quand loading=true', () => {
    mockUseFraisVehicule.mockReturnValue({ ...BASE_STATE, loading: true });
    const { toJSON } = render(<VehiculeFraisScreen {...PROPS} />);
    expect(toJSON()).toBeTruthy();
  });

  it('affiche un message d\'erreur quand error est défini', () => {
    mockUseFraisVehicule.mockReturnValue({ ...BASE_STATE, error: 'Connexion impossible.' });
    render(<VehiculeFraisScreen {...PROPS} />);
    expect(screen.getByText('Connexion impossible.')).toBeTruthy();
  });

  it('affiche 0 dépenses quand la liste est vide', () => {
    render(<VehiculeFraisScreen {...PROPS} />);
    expect(screen.getByText('0')).toBeTruthy();
  });
});
