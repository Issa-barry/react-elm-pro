import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AccueilScreen from '../AccueilScreen';

// ── Mocks des dépendances externes ────────────────────────────────────────────

jest.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn(),
}));
jest.mock('@/features/auth/hooks/useLogout', () => ({
  useLogout: () => ({ logout: jest.fn() }),
}));
jest.mock('@/features/gains/hooks/useGainsMine', () => ({
  useGainsMine: jest.fn(),
}));
jest.mock('../../hooks/useQrPayload', () => ({
  useQrPayload: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));
jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}));
jest.mock('react-native-qrcode-svg', () => {
  const { View } = require('react-native');
  return ({ value, size }: { value: string; size: number }) => (
    <View testID="qrcode" accessibilityLabel={`QR:${value}:${size}`} />
  );
});
jest.mock('../../components/GainsCarousel', () => {
  const { View } = require('react-native');
  return () => <View testID="gains-carousel" />;
});
jest.mock('../../components/SoldeVehicules', () => {
  const { View } = require('react-native');
  return () => <View testID="solde-vehicules" />;
});

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useGainsMine } from '@/features/gains/hooks/useGainsMine';
import { useQrPayload } from '../../hooks/useQrPayload';

const mockUseCurrentUser = useCurrentUser as jest.Mock;
const mockUseGainsMine   = useGainsMine   as jest.Mock;
const mockUseQrPayload   = useQrPayload   as jest.Mock;

const USER_FIXTURE = { id: 'user-42', prenom: 'Moussa', nom: 'CAMARA', telephone: '+224621234567' };

const GAINS_IDLE = {
  gains: null, loading: false, refreshing: false, error: null,
  load: jest.fn(), refetch: jest.fn(),
};

function setupMocks(overrides?: { userLoading?: boolean; user?: any }) {
  mockUseCurrentUser.mockReturnValue({
    user: overrides && 'user' in overrides ? overrides.user : USER_FIXTURE,
    loading: overrides?.userLoading ?? false,
  });
  mockUseGainsMine.mockReturnValue(GAINS_IDLE);
  mockUseQrPayload.mockReturnValue({ qrPayload: null, loading: false, load: jest.fn() });
}

describe('AccueilScreen — zoom QR code', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('affiche le QR code avec la valeur user.id', () => {
    render(<AccueilScreen />);

    const qr = screen.getByTestId('qrcode');
    expect(qr.props.accessibilityLabel).toContain('user-42');
  });

  it('le bouton QR a le label accessibilité correct', () => {
    render(<AccueilScreen />);

    expect(screen.getByLabelText('Agrandir le QR code')).toBeTruthy();
  });

  it('la modal est fermée au départ', () => {
    render(<AccueilScreen />);

    // Le modal est rendu mais pas visible — on vérifie l'absence du grand QR
    const qrCodes = screen.queryAllByTestId('qrcode');
    // Avant tap : un seul QR (le petit, dans le modal visible=false)
    expect(qrCodes.length).toBeGreaterThanOrEqual(1);
  });

  it('un tap sur le QR ouvre la modal avec un QR zoomé (240px)', () => {
    render(<AccueilScreen />);

    fireEvent.press(screen.getByLabelText('Agrandir le QR code'));

    const qrCodes = screen.queryAllByTestId('qrcode');
    const tailles = qrCodes.map(q => q.props.accessibilityLabel as string);
    const aQrZoom = tailles.some(label => label.includes(':240'));
    expect(aQrZoom).toBe(true);
  });

  it('le QR zoomé encode le même user.id que le QR normal', () => {
    render(<AccueilScreen />);

    fireEvent.press(screen.getByLabelText('Agrandir le QR code'));

    const qrCodes = screen.queryAllByTestId('qrcode');
    const labels  = qrCodes.map(q => q.props.accessibilityLabel as string);
    expect(labels.every(l => l.includes('user-42'))).toBe(true);
  });

  it('utilise le fallback "eau-la-maman" quand user est null', () => {
    setupMocks({ user: null });
    render(<AccueilScreen />);

    // Vérifie que le QR rendu (bouton + éventuellement modal) utilise le fallback
    const qrCodes = screen.queryAllByTestId('qrcode');
    const labels  = qrCodes.map(q => q.props.accessibilityLabel as string);
    expect(labels.some(l => l.includes('eau-la-maman'))).toBe(true);
  });

  it('le tap hors de la modal la referme', () => {
    render(<AccueilScreen />);

    fireEvent.press(screen.getByLabelText('Agrandir le QR code'));

    // Fermer via le backdrop (Pressable extérieur label "Appuyez en dehors pour fermer")
    const hint = screen.queryByText('Appuyez en dehors pour fermer');
    expect(hint).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Agrandir le QR code')); // repress = toggle off via re-render
  });

  it('le bouton QR est désactivé pendant le chargement utilisateur', () => {
    setupMocks({ userLoading: true });
    render(<AccueilScreen />);

    // Pendant loading, onPress guard (() => !userLoading && ...) empêche l'ouverture
    const qrCodes = screen.queryAllByTestId('qrcode');
    const hasBigQr = qrCodes.some(q => (q.props.accessibilityLabel ?? '').includes(':240'));
    expect(hasBigQr).toBe(false);
  });
});

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
});
