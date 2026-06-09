import React from 'react';
import { render, screen } from '@testing-library/react-native';
import VehiculesScreen from '../VehiculesScreen';
import { useVehiculesMine } from '@/features/vehicule/hooks/useVehiculesMine';
import type { VehiculeApi } from '@/features/vehicule/types/vehicule.types';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router:         { push: jest.fn(), replace: jest.fn() },
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

jest.mock('@/features/vehicule/hooks/useVehiculesMine');

const mockUseVehiculesMine = useVehiculesMine as jest.MockedFunction<typeof useVehiculesMine>;

const VEHICULE_FIXTURE: VehiculeApi = {
  id: 'v1', nom: 'Nen Dow', immatriculation: 'RC-001-GN',
  type: 'Camion', capacite: 500, is_active: true, photo_url: null,
  role: 'proprietaire', en_livraison: false,
};

const BASE_STATE = { vehicules: [], loading: false, refreshing: false, error: null, load: jest.fn(), refetch: jest.fn() };

describe('VehiculesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVehiculesMine.mockReturnValue(BASE_STATE);
  });

  it('affiche le titre Mes véhicules', () => {
    render(<VehiculesScreen />);
    expect(screen.getByText('Mes véhicules')).toBeTruthy();
  });

  it('affiche un indicateur de chargement quand loading=true', () => {
    mockUseVehiculesMine.mockReturnValue({ ...BASE_STATE, loading: true });
    render(<VehiculesScreen />);
    expect(screen.getByText('Chargement des véhicules…')).toBeTruthy();
  });

  it('affiche l\'état vide quand la liste est vide', () => {
    render(<VehiculesScreen />);
    expect(screen.getByText('Aucun véhicule')).toBeTruthy();
  });

  it('affiche un message d\'erreur quand error est défini', () => {
    mockUseVehiculesMine.mockReturnValue({ ...BASE_STATE, error: 'Connexion impossible.' });
    render(<VehiculesScreen />);
    expect(screen.getByText('Connexion impossible.')).toBeTruthy();
    expect(screen.getByText('Réessayer')).toBeTruthy();
  });

  it('affiche la liste des véhicules quand des données sont disponibles', () => {
    mockUseVehiculesMine.mockReturnValue({ ...BASE_STATE, vehicules: [VEHICULE_FIXTURE] });
    render(<VehiculesScreen />);
    expect(screen.getByText('Nen Dow')).toBeTruthy();
    expect(screen.getByText('RC-001-GN')).toBeTruthy();
    expect(screen.getByText('1 véhicule')).toBeTruthy();
  });

  it('affiche le pluriel pour plusieurs véhicules', () => {
    const v2 = { ...VEHICULE_FIXTURE, id: 'v2', nom: 'Baba Ousou', immatriculation: 'VN-001-GN' };
    mockUseVehiculesMine.mockReturnValue({ ...BASE_STATE, vehicules: [VEHICULE_FIXTURE, v2] });
    render(<VehiculesScreen />);
    expect(screen.getByText('2 véhicules')).toBeTruthy();
  });

  it('affiche le bouton Proposer un véhicule', () => {
    render(<VehiculesScreen />);
    expect(screen.getByText('Proposer un véhicule')).toBeTruthy();
  });
});
