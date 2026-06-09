import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import WelcomeScreen from '../WelcomeScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockRouter = require('expo-router').router as { push: jest.Mock; replace: jest.Mock; back: jest.Mock };

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: any) => <View>{children}</View>,
    Path: () => null,
    Circle: () => null,
    Ellipse: () => null,
    G: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('@/features/auth/components/HeroIllustration', () => ({
  HeroIllustration: () => null,
}));

describe('WelcomeScreen — rendu', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('affiche la partie "EAU" du titre', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText('EAU ')).toBeTruthy();
  });

  it('affiche la partie "la maman" du titre', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText('la maman')).toBeTruthy();
  });

  it('affiche le bouton "Se connecter"', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText('Se connecter')).toBeTruthy();
  });

  it("affiche le bouton \"S'inscrire\"", () => {
    render(<WelcomeScreen />);
    expect(screen.getByText("S'inscrire")).toBeTruthy();
  });

  it('affiche les deux sous-titres', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText(/véhicule/i)).toBeTruthy();
    expect(screen.getByText(/livreur/i)).toBeTruthy();
  });
});

describe('WelcomeScreen — navigation', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('"Se connecter" navigue vers la page de connexion', () => {
    render(<WelcomeScreen />);
    fireEvent.press(screen.getByText('Se connecter'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/login');
  });

  it('"S\'inscrire" navigue vers la page d\'inscription', () => {
    render(<WelcomeScreen />);
    fireEvent.press(screen.getByText("S'inscrire"));
    expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/register');
  });
});
