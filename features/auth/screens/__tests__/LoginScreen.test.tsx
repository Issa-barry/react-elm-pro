import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockRouter = require('expo-router').router as { push: jest.Mock; replace: jest.Mock; back: jest.Mock };

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@/shared/components/AppLogo', () => ({
  AppLogo: () => null,
}));

jest.mock('@/shared/components/CloseButton', () => ({
  CloseButton: () => null,
}));

jest.mock('../../components/PhoneInput', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextInput } = require('react-native');
  return {
    PhoneInput: ({ onChangePhone, error }: any) => (
      <TextInput
        testID="phone-input"
        onChangeText={onChangePhone}
        accessibilityHint={error ?? ''}
      />
    ),
  };
});

jest.mock('../../components/PasswordInput', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextInput } = require('react-native');
  return {
    PasswordInput: ({ onChangeText, error }: any) => (
      <TextInput
        testID="password-input"
        secureTextEntry
        onChangeText={onChangeText}
        accessibilityHint={error ?? ''}
      />
    ),
  };
});

jest.mock('../../hooks/useLogin', () => ({
  useLogin: jest.fn(),
}));

import { useLogin } from '../../hooks/useLogin';

const mockUseLogin = useLogin as jest.Mock;

const DEFAULT_STATE = {
  codePays:       'GN',
  prefix:         '+224',
  telephoneLocal: '',
  password:       '',
  loading:        false,
  errors:         {},
  globalError:    '',
};

function setup(overrides: Record<string, unknown> = {}) {
  const mockSubmit = jest.fn();
  const mockSet    = jest.fn();
  mockUseLogin.mockReturnValue({
    state:      { ...DEFAULT_STATE, ...overrides },
    set:        mockSet,
    setCountry: jest.fn(),
    submit:     mockSubmit,
  });
  return { mockSubmit, mockSet };
}

// ─── Rendu ────────────────────────────────────────────────────────────────────

describe('LoginScreen — rendu', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('affiche le titre "Connexion"', () => {
    setup();
    render(<LoginScreen />);
    expect(screen.getByText('Connexion')).toBeTruthy();
  });

  it('affiche le champ téléphone', () => {
    setup();
    render(<LoginScreen />);
    expect(screen.getByTestId('phone-input')).toBeTruthy();
  });

  it('affiche le champ mot de passe', () => {
    setup();
    render(<LoginScreen />);
    expect(screen.getByTestId('password-input')).toBeTruthy();
  });

  it('affiche le bouton "Se connecter"', () => {
    setup();
    render(<LoginScreen />);
    expect(screen.getByLabelText('Se connecter')).toBeTruthy();
  });

  it('affiche le lien "Mot de passe oublié ?"', () => {
    setup();
    render(<LoginScreen />);
    expect(screen.getByText('Mot de passe oublié ?')).toBeTruthy();
  });
});

// ─── État du bouton ───────────────────────────────────────────────────────────

describe('LoginScreen — bouton Se connecter', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('est désactivé si les champs sont vides', () => {
    setup({ telephoneLocal: '', password: '' });
    render(<LoginScreen />);
    const btn = screen.getByLabelText('Se connecter');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeTruthy();
  });

  it('est actif si téléphone et mot de passe sont remplis', () => {
    setup({ telephoneLocal: '621234567', password: 'Test@1234' });
    render(<LoginScreen />);
    const btn = screen.getByLabelText('Se connecter');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeFalsy();
  });

  it('est désactivé pendant le chargement', () => {
    setup({ telephoneLocal: '621234567', password: 'Test@1234', loading: true });
    render(<LoginScreen />);
    const btn = screen.getByLabelText('Se connecter');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeTruthy();
  });
});

// ─── Erreurs globales ─────────────────────────────────────────────────────────

describe('LoginScreen — erreur globale', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('affiche le message d\'erreur global', () => {
    setup({ globalError: 'Identifiants incorrects.', telephoneLocal: '621234567', password: 'Test@1234' });
    render(<LoginScreen />);
    expect(screen.getByText('Identifiants incorrects.')).toBeTruthy();
  });

  it('n\'affiche rien si pas d\'erreur globale', () => {
    setup({ globalError: '' });
    render(<LoginScreen />);
    expect(screen.queryByText('Identifiants incorrects.')).toBeNull();
  });
});

// ─── Navigation ───────────────────────────────────────────────────────────────

describe('LoginScreen — navigation', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('"Mot de passe oublié ?" navigue vers forgot-password', () => {
    setup();
    render(<LoginScreen />);
    fireEvent.press(screen.getByLabelText('Mot de passe oublié'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/forgot-password');
  });

  it('un tap sur "Se connecter" appelle submit()', () => {
    const { mockSubmit } = setup({ telephoneLocal: '621234567', password: 'Test@1234' });
    render(<LoginScreen />);
    fireEvent.press(screen.getByLabelText('Se connecter'));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
});
