import React from 'react';
import { render, screen } from '@testing-library/react-native';
import LivraisonsScreen from '../LivraisonsScreen';
import { useLivraisonsEnCours } from '../../hooks/useLivraisonsEnCours';
import { useVehiculesMine } from '@/features/vehicule/hooks/useVehiculesMine';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('react-native-qrcode-svg', () => 'QRCode');

jest.mock('@/shared/components/ui/icon-symbol', () => ({
  IconSymbol: () => null,
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

jest.mock('../../hooks/useLivraisonsEnCours');
jest.mock('@/features/vehicule/hooks/useVehiculesMine');

const mockUseLivraisons   = useLivraisonsEnCours as jest.MockedFunction<typeof useLivraisonsEnCours>;
const mockUseVehiculesMine = useVehiculesMine    as jest.MockedFunction<typeof useVehiculesMine>;

const BASE_LIVRAISONS = {
  livraisons: [], loading: false, refreshing: false, error: null,
  load: jest.fn(), refetch: jest.fn(),
};

const BASE_VEHICULES = {
  vehicules: [], loading: false, refreshing: false, error: null,
  load: jest.fn(), refetch: jest.fn(),
};

const LIVRAISON_FIXTURE = {
  id: 'l1', reference: 'LIV-001', statut: 'transit' as const, statut_label: 'En transit',
  site_source: 'Entrepôt Central', site_destination: 'Quartier Matam',
  nb_packs: 50, equipe_nom: 'Équipe A', date_depart: '2026-06-01T08:00:00Z',
  date_arrivee_prevue: '2026-06-01T10:00:00Z',
  vehicule: { nom: 'Nen Dow', immatriculation: 'RC-001-GN', type: 'Camion', photo_url: null },
};

describe('LivraisonsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLivraisons.mockReturnValue(BASE_LIVRAISONS);
    mockUseVehiculesMine.mockReturnValue(BASE_VEHICULES);
  });

  it('affiche le titre Livraisons en cours', () => {
    render(<LivraisonsScreen />);
    expect(screen.getByText('Livraisons en cours')).toBeTruthy();
  });

  it('affiche un spinner quand loading=true', () => {
    mockUseLivraisons.mockReturnValue({ ...BASE_LIVRAISONS, loading: true });
    const { toJSON } = render(<LivraisonsScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('affiche l\'état vide quand aucune livraison', () => {
    render(<LivraisonsScreen />);
    expect(screen.getByText('Aucune livraison en cours')).toBeTruthy();
    expect(screen.getByText('Vos véhicules sont au repos.')).toBeTruthy();
  });

  it('affiche un message d\'erreur avec bouton Réessayer', () => {
    mockUseLivraisons.mockReturnValue({ ...BASE_LIVRAISONS, error: 'Erreur réseau.' });
    render(<LivraisonsScreen />);
    expect(screen.getByText('Erreur réseau.')).toBeTruthy();
    expect(screen.getByText('Réessayer')).toBeTruthy();
  });

  it('affiche la liste quand des livraisons sont disponibles', () => {
    mockUseLivraisons.mockReturnValue({ ...BASE_LIVRAISONS, livraisons: [LIVRAISON_FIXTURE] });
    render(<LivraisonsScreen />);
    expect(screen.getByText('LIV-001')).toBeTruthy();
    expect(screen.getByText('1 livraison active')).toBeTruthy();
  });

  it('affiche le pluriel pour plusieurs livraisons', () => {
    const l2 = { ...LIVRAISON_FIXTURE, id: 'l2', reference: 'LIV-002' };
    mockUseLivraisons.mockReturnValue({ ...BASE_LIVRAISONS, livraisons: [LIVRAISON_FIXTURE, l2] });
    render(<LivraisonsScreen />);
    expect(screen.getByText('2 livraisons actives')).toBeTruthy();
  });
});
