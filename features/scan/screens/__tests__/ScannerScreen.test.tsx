jest.setTimeout(15000);

jest.mock('expo-camera', () => {
  const R  = require('react');
  const RN = require('react-native');
  return {
    CameraView: ({ onBarcodeScanned }: { onBarcodeScanned?: (e: { data: string }) => void }) =>
      R.createElement(RN.TouchableOpacity, {
        testID: 'camera-trigger',
        onPress: () => onBarcodeScanned?.({ data: 'test-qr' }),
      }),
    useCameraPermissions: jest.fn(),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
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
  }),
}));

jest.mock('../../services/scan.service', () => ({
  scanService: { scan: jest.fn() },
}));

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { useCameraPermissions } from 'expo-camera';
import ScannerScreen from '../ScannerScreen';
import { scanService } from '../../services/scan.service';
import type { ScanResult } from '../../types/scan.types';
import type { ApiResult } from '@/features/auth/types/auth.types';

const mockUseCameraPermissions = useCameraPermissions as jest.MockedFunction<typeof useCameraPermissions>;
const mockScan = scanService.scan as jest.MockedFunction<typeof scanService.scan>;

function mockGranted() {
  mockUseCameraPermissions.mockReturnValue([
    { granted: true, canAskAgain: true, status: 'granted', expires: 'never' } as any,
    jest.fn(),
    jest.fn(),
  ] as any);
}

const USER_RESULT: ApiResult<ScanResult> = {
  ok: true,
  data: {
    type: 'user',
    data: {
      user_id: '1',
      nom_complet: 'Jean Dupont',
      nom: 'Dupont',
      prenom: 'Jean',
      phone: '+224620000000',
      ville: 'Conakry',
      quartier: null,
      roles: ['livreur'],
      vehicules: [{ nom: 'Toyota', immatriculation: 'RC-001-GN' }],
    },
  },
};

const CLIENT_RESULT: ApiResult<ScanResult> = {
  ok: true,
  data: {
    type: 'client',
    data: {
      id: '2',
      reference: 'CLI-20260601-0001',
      nom_complet: 'Acme Corp',
      nom: 'Corp',
      prenom: null,
      raison_sociale: 'Acme SARL',
      phone: null,
      email: null,
      ville: null,
      quartier: null,
      adresse: '123 Rue Test',
      is_active: false,
    },
  },
};

const LIVRAISON_RESULT: ApiResult<ScanResult> = {
  ok: true,
  data: {
    type: 'livraison',
    data: {
      type: 'commande',
      reference: 'VT-00001-ABC',
      statut: 'en_cours',
      statut_label: 'En cours',
      site_source: 'Dépôt central',
      client_nom: 'Client Test',
      client_telephone: '+224620000001',
      client_adresse: '456 Avenue Test',
      nb_packs: 3,
      vehicule: { nom: 'Toyota', immatriculation: 'RC-002-GN' },
      equipe_nom: 'Équipe A',
      date_commande: '01/06/2026',
    },
  },
};

describe('ScannerScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('affiche un spinner quand permission=null (chargement initial)', () => {
    mockUseCameraPermissions.mockReturnValue([null, jest.fn(), jest.fn()] as any);
    const { toJSON } = render(<ScannerScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('affiche le bouton d\'autorisation quand permission non accordée', () => {
    mockUseCameraPermissions.mockReturnValue([
      { granted: false, canAskAgain: true, status: 'undetermined', expires: 'never' } as any,
      jest.fn(),
      jest.fn(),
    ] as any);
    render(<ScannerScreen />);
    expect(screen.getByText('Autoriser la caméra')).toBeTruthy();
    expect(screen.getByText('Annuler')).toBeTruthy();
  });

  it('affiche l\'interface caméra quand permission accordée', () => {
    mockGranted();
    mockScan.mockResolvedValue(USER_RESULT);
    const { toJSON } = render(<ScannerScreen />);
    expect(toJSON()).toBeTruthy();
    expect(screen.getByText('Pointez vers le QR code')).toBeTruthy();
  });

  it('affiche la UserCard après un scan utilisateur', async () => {
    mockGranted();
    mockScan.mockResolvedValue(USER_RESULT);
    render(<ScannerScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('camera-trigger'));
    });

    expect(screen.getByText('Jean Dupont')).toBeTruthy();
  });

  it('ferme la UserCard quand on presse "Fermer"', async () => {
    mockGranted();
    mockScan.mockResolvedValue(USER_RESULT);
    render(<ScannerScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('camera-trigger'));
    });

    fireEvent.press(screen.getByText('Fermer'));
    expect(screen.queryByText('Jean Dupont')).toBeNull();
  });

  it('affiche la ClientCard après un scan client', async () => {
    mockGranted();
    mockScan.mockResolvedValue(CLIENT_RESULT);
    render(<ScannerScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('camera-trigger'));
    });

    expect(screen.getByText('Acme Corp')).toBeTruthy();
    expect(screen.getByText('Inactif')).toBeTruthy();
  });

  it('affiche la LivraisonCard après un scan livraison', async () => {
    mockGranted();
    mockScan.mockResolvedValue(LIVRAISON_RESULT);
    render(<ScannerScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('camera-trigger'));
    });

    expect(screen.getByText('VT-00001-ABC')).toBeTruthy();
    expect(screen.getByText('En cours')).toBeTruthy();
  });

  it('modifie le zoom via les boutons + et −', () => {
    mockGranted();
    mockScan.mockResolvedValue(USER_RESULT);
    render(<ScannerScreen />);
    expect(screen.getByText('0×')).toBeTruthy();
    fireEvent.press(screen.getByText('+'));
    expect(screen.getByText('1×')).toBeTruthy();
    fireEvent.press(screen.getByText('−'));
    expect(screen.getByText('0×')).toBeTruthy();
  });
});
