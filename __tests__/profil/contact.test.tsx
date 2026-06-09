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

jest.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn().mockReturnValue({
    user: { id: 'u1', prenom: 'Moussa', nom: 'CAMARA', telephone: '+224621234567' },
    loading: false,
  }),
}));

const mockEnvoyerMessage = jest.fn();
jest.mock('@/features/contact/services/contact-api.service', () => ({
  envoyerMessage: (...args: unknown[]) => mockEnvoyerMessage(...args),
}));

import ContactScreen from '../../app/profil/contact';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ContactScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockEnvoyerMessage.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('affiche le titre Contact et le bouton Envoyer', () => {
    render(<ContactScreen />);
    expect(screen.getByText('Contact')).toBeTruthy();
    expect(screen.getByText('Envoyer le message')).toBeTruthy();
  });

  it('le bouton est désactivé si le message est vide', () => {
    render(<ContactScreen />);
    const btn = screen.getByText('Envoyer le message');
    expect(btn).toBeTruthy();
    fireEvent.press(btn);
    expect(mockEnvoyerMessage).not.toHaveBeenCalled();
  });

  it('envoie le message et affiche une alerte de succès', async () => {
    render(<ContactScreen />);

    const input = screen.getByPlaceholderText(/Décrivez votre demande/i);
    fireEvent.changeText(input, 'Bonjour, j\'ai un problème.');
    fireEvent.press(screen.getByText('Envoyer le message'));

    await waitFor(() => {
      expect(mockEnvoyerMessage).toHaveBeenCalledWith('Bonjour, j\'ai un problème.');
      expect(Alert.alert).toHaveBeenCalledWith('Message envoyé', expect.any(String), expect.any(Array));
    });
  });

  it("affiche une alerte d'erreur si l'envoi échoue", async () => {
    mockEnvoyerMessage.mockResolvedValue({ ok: false, error: 'Erreur réseau.' });
    render(<ContactScreen />);

    const input = screen.getByPlaceholderText(/Décrivez votre demande/i);
    fireEvent.changeText(input, 'Message de test');
    fireEvent.press(screen.getByText('Envoyer le message'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Erreur réseau.');
    });
  });
});
