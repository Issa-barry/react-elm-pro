import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import RegisterScreen from '../RegisterScreen';

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
  MaterialCommunityIcons: () => null,
}));

jest.mock('react-native-svg', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: any) => <View>{children}</View>,
    Path: () => null,
  };
});

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn().mockResolvedValue(undefined),
}));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockLinking = require('react-native/Libraries/Linking/Linking') as { openURL: jest.Mock };

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

jest.mock('../../components/AuthInput', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextInput } = require('react-native');
  return {
    AuthInput: ({ label, onChangeText, error }: any) => (
      <TextInput
        testID={`auth-input-${label}`}
        onChangeText={onChangeText}
        accessibilityHint={error ?? ''}
        accessibilityLabel={label}
      />
    ),
  };
});

jest.mock('../../components/PasswordInput', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextInput } = require('react-native');
  return {
    PasswordInput: ({ label, onChangeText, error }: any) => (
      <TextInput
        testID={`password-input-${label}`}
        secureTextEntry
        onChangeText={onChangeText}
        accessibilityHint={error ?? ''}
        accessibilityLabel={label}
      />
    ),
  };
});

jest.mock('../../hooks/useRegister', () => ({
  useRegister: jest.fn(),
  TOTAL_STEPS: 4,
}));

import { useRegister } from '../../hooks/useRegister';

const mockUseRegister = useRegister as jest.Mock;
const mockNext = jest.fn();
const mockBack = jest.fn();
const mockSet  = jest.fn();

const BASE_STATE = {
  step: 1, done: false,
  codePays: 'GN', prefix: '+224',
  telephoneLocal: '', telephone: '',
  prenom: '', nom: '', prefilled: false,
  email: '', password: '', passwordConfirmation: '',
  loading: false, errors: {}, globalError: '',
  registeredEmail: '',
};

function setup(overrides: Record<string, unknown> = {}) {
  mockUseRegister.mockReturnValue({
    state:      { ...BASE_STATE, ...overrides },
    set:        mockSet,
    setCountry: jest.fn(),
    next:       mockNext,
    back:       mockBack,
  });
}

// ─── Titres par étape ─────────────────────────────────────────────────────────

describe('RegisterScreen — titres par étape', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('affiche "Créer votre compte" à l\'étape 1', () => {
    setup({ step: 1 });
    render(<RegisterScreen />);
    expect(screen.getByText('Créer votre compte')).toBeTruthy();
  });

  it('affiche "Vos informations" à l\'étape 2', () => {
    setup({ step: 2 });
    render(<RegisterScreen />);
    expect(screen.getByText('Vos informations')).toBeTruthy();
  });

  it('affiche "Votre adresse email" à l\'étape 3', () => {
    setup({ step: 3 });
    render(<RegisterScreen />);
    expect(screen.getByText('Votre adresse email')).toBeTruthy();
  });

  it('affiche "Votre mot de passe" à l\'étape 4', () => {
    setup({ step: 4, prenom: 'Moussa', nom: 'CAMARA', email: 'x@x.com', telephone: '+224621234567' });
    render(<RegisterScreen />);
    expect(screen.getByText('Votre mot de passe')).toBeTruthy();
  });
});

// ─── Bouton Continuer — état désactivé ───────────────────────────────────────

describe('RegisterScreen — bouton désactivé si champs vides', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('étape 1 : désactivé si téléphone vide', () => {
    setup({ step: 1, telephoneLocal: '' });
    render(<RegisterScreen />);
    const btn = screen.getByLabelText('Étape suivante');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeTruthy();
  });

  it('étape 1 : actif si téléphone rempli', () => {
    setup({ step: 1, telephoneLocal: '621234567' });
    render(<RegisterScreen />);
    const btn = screen.getByLabelText('Étape suivante');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeFalsy();
  });

  it('étape 2 : désactivé si prénom < 2 caractères', () => {
    setup({ step: 2, prenom: 'A', nom: 'CAMARA' });
    render(<RegisterScreen />);
    const btn = screen.getByLabelText('Étape suivante');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeTruthy();
  });

  it('étape 2 : actif si prénom et nom valides', () => {
    setup({ step: 2, prenom: 'Moussa', nom: 'CAMARA' });
    render(<RegisterScreen />);
    const btn = screen.getByLabelText('Étape suivante');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeFalsy();
  });

  it('étape 3 : désactivé si email vide', () => {
    setup({ step: 3, email: '' });
    render(<RegisterScreen />);
    const btn = screen.getByLabelText('Étape suivante');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeTruthy();
  });

  it('étape 3 : actif si email rempli', () => {
    setup({ step: 3, email: 'test@example.com' });
    render(<RegisterScreen />);
    const btn = screen.getByLabelText('Étape suivante');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeFalsy();
  });

  it('étape 4 : désactivé si mot de passe vide', () => {
    setup({ step: 4, password: '', passwordConfirmation: '', prenom: 'Moussa', nom: 'CAMARA', email: 'x@x.com', telephone: '+224621234567' });
    render(<RegisterScreen />);
    const btn = screen.getByLabelText('Créer mon compte');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeTruthy();
  });

  it('étape 4 : actif si mot de passe et confirmation remplis', () => {
    setup({ step: 4, password: 'Test@1234', passwordConfirmation: 'Test@1234', prenom: 'Moussa', nom: 'CAMARA', email: 'x@x.com', telephone: '+224621234567' });
    render(<RegisterScreen />);
    const btn = screen.getByLabelText('Créer mon compte');
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeFalsy();
  });
});

// ─── Navigation flèche retour ─────────────────────────────────────────────────

describe('RegisterScreen — flèche retour', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('à l\'étape 1 : router.back() est appelé', () => {
    setup({ step: 1 });
    render(<RegisterScreen />);
    fireEvent.press(screen.getByLabelText('Retour'));
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('à l\'étape 2 : back() du hook est appelé', () => {
    setup({ step: 2 });
    render(<RegisterScreen />);
    fireEvent.press(screen.getByLabelText('Retour'));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockRouter.back).not.toHaveBeenCalled();
  });
});

// ─── Erreur globale ───────────────────────────────────────────────────────────

describe('RegisterScreen — erreur globale', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('affiche le message si globalError est défini', () => {
    setup({ step: 1, globalError: 'Numéro déjà utilisé.' });
    render(<RegisterScreen />);
    expect(screen.getByText('Numéro déjà utilisé.')).toBeTruthy();
  });

  it('n\'affiche rien si globalError est vide', () => {
    setup({ step: 1, globalError: '' });
    render(<RegisterScreen />);
    expect(screen.queryByText('Numéro déjà utilisé.')).toBeNull();
  });
});

// ─── État done : écran de confirmation ───────────────────────────────────────

describe('RegisterScreen — état done', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('affiche le titre de confirmation', () => {
    setup({ done: true, registeredEmail: 'moussa@example.com' });
    render(<RegisterScreen />);
    expect(screen.getByText('CONFIRMEZ VOTRE\nADRESSE E-MAIL')).toBeTruthy();
  });

  it("affiche l'email de l'utilisateur", () => {
    setup({ done: true, registeredEmail: 'moussa@example.com' });
    render(<RegisterScreen />);
    expect(screen.getByText('moussa@example.com')).toBeTruthy();
  });

  it('affiche le bouton "Accéder à la boîte mail"', () => {
    setup({ done: true, registeredEmail: 'moussa@example.com' });
    render(<RegisterScreen />);
    expect(screen.getByLabelText('Accéder à la boîte mail')).toBeTruthy();
  });

  it('affiche le lien "Retour à la connexion"', () => {
    setup({ done: true, registeredEmail: 'moussa@example.com' });
    render(<RegisterScreen />);
    expect(screen.getByLabelText('Retour à la connexion')).toBeTruthy();
  });

  it('"Retour à la connexion" navigue vers login', () => {
    setup({ done: true, registeredEmail: 'moussa@example.com' });
    render(<RegisterScreen />);
    fireEvent.press(screen.getByLabelText('Retour à la connexion'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/login');
  });
});

// ─── Sélecteur de boîte mail ─────────────────────────────────────────────────

describe('RegisterScreen — sélecteur boîte mail', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('le modal est masqué par défaut', () => {
    setup({ done: true, registeredEmail: 'moussa@example.com' });
    render(<RegisterScreen />);
    expect(screen.queryByText('Gmail')).toBeNull();
  });

  it('appuyer sur "Accéder à la boîte mail" affiche le sélecteur', () => {
    setup({ done: true, registeredEmail: 'moussa@example.com' });
    render(<RegisterScreen />);
    fireEvent.press(screen.getByLabelText('Accéder à la boîte mail'));
    expect(screen.getByText('Gmail')).toBeTruthy();
    expect(screen.getByText('Microsoft Outlook')).toBeTruthy();
    expect(screen.getByText('Mail')).toBeTruthy();
  });

  it('appuyer sur "Annuler" ferme le sélecteur', () => {
    setup({ done: true, registeredEmail: 'moussa@example.com' });
    render(<RegisterScreen />);
    fireEvent.press(screen.getByLabelText('Accéder à la boîte mail'));
    fireEvent.press(screen.getByText('Annuler'));
    expect(screen.queryByText('Gmail')).toBeNull();
  });
});

void mockLinking; // referenced only to avoid unused-import warning
