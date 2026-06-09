jest.setTimeout(30000);

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@/shared/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff', surface: '#fff', surfaceAlt: '#f5f5f5',
      text: '#000', textMuted: '#999', primary: '#2563eb',
      primaryLight: '#dbeafe', border: '#e5e7eb',
      danger: '#dc2626', dangerBg: '#fee2e2', primaryFg: '#fff',
    },
    isDark: false,
  }),
}));

const mockChangePassword = jest.fn();
jest.mock('@/features/auth/services/profile-api.service', () => ({
  changePassword: (...args: unknown[]) => mockChangePassword(...args),
}));

import MotDePasseScreen from '../../app/profil/mot-de-passe';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fillField(placeholder: RegExp | string, value: string) {
  const input = screen.getByDisplayValue(value) ?? null;
  if (!input) {
    // find by label text above the input — match via accessible queries
  }
}

function setup() {
  render(<MotDePasseScreen />);

  const inputs = screen.getAllByDisplayValue('');
  const [currentInput, nextInput, confirmInput] = inputs;

  return { currentInput, nextInput, confirmInput };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MotDePasseScreen — validation', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockChangePassword.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('affiche le bouton Mettre à jour', () => {
    render(<MotDePasseScreen />);
    expect(screen.getByText('Mettre à jour')).toBeTruthy();
  });

  it('affiche une erreur si les champs sont vides et on soumet', async () => {
    render(<MotDePasseScreen />);
    fireEvent.press(screen.getByText('Mettre à jour'));

    await waitFor(() => {
      expect(mockChangePassword).not.toHaveBeenCalled();
    });
  });

  it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
    render(<MotDePasseScreen />);

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.changeText(inputs[0], 'AncienMdp1!');
    fireEvent.changeText(inputs[1], 'NouveauMdp1!');
    fireEvent.changeText(inputs[2], 'Différent1!');

    fireEvent.press(screen.getByText('Mettre à jour'));

    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas.')).toBeTruthy();
    });
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it('affiche une erreur si le mot de passe est trop court', async () => {
    render(<MotDePasseScreen />);

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.changeText(inputs[0], 'AncienMdp1!');
    fireEvent.changeText(inputs[1], 'Court');
    fireEvent.changeText(inputs[2], 'Court');

    fireEvent.press(screen.getByText('Mettre à jour'));

    await waitFor(() => {
      expect(screen.getByText('Le mot de passe doit contenir au moins 8 caractères.')).toBeTruthy();
    });
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it('appelle changePassword avec les bons paramètres si les champs sont valides', async () => {
    render(<MotDePasseScreen />);

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.changeText(inputs[0], 'AncienMdp1!');
    fireEvent.changeText(inputs[1], 'NouveauMdp1!');
    fireEvent.changeText(inputs[2], 'NouveauMdp1!');

    fireEvent.press(screen.getByText('Mettre à jour'));

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        current_password:      'AncienMdp1!',
        password:              'NouveauMdp1!',
        password_confirmation: 'NouveauMdp1!',
      });
    });
  });

  it('affiche une alerte de succès et navigue en arrière après mise à jour', async () => {
    const mockBack = require('expo-router').router.back as jest.Mock;
    render(<MotDePasseScreen />);

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.changeText(inputs[0], 'AncienMdp1!');
    fireEvent.changeText(inputs[1], 'NouveauMdp1!');
    fireEvent.changeText(inputs[2], 'NouveauMdp1!');

    fireEvent.press(screen.getByText('Mettre à jour'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Succès', expect.any(String), expect.any(Array));
    });

    // Simule le clic sur OK dans l'alerte
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const okBtn = alertCall[2]?.find((b: any) => b.text === 'OK');
    okBtn?.onPress?.();
    expect(mockBack).toHaveBeenCalled();
  });

  it('affiche l\'erreur API si le mot de passe actuel est incorrect', async () => {
    mockChangePassword.mockResolvedValue({
      ok: false,
      fieldErrors: { current_password: 'Le mot de passe actuel est incorrect.' },
    });

    render(<MotDePasseScreen />);

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.changeText(inputs[0], 'MauvaisMdp');
    fireEvent.changeText(inputs[1], 'NouveauMdp1!');
    fireEvent.changeText(inputs[2], 'NouveauMdp1!');

    fireEvent.press(screen.getByText('Mettre à jour'));

    await waitFor(() => {
      expect(screen.getByText('Le mot de passe actuel est incorrect.')).toBeTruthy();
    });
  });
});
