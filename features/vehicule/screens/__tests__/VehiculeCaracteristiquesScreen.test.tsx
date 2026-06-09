import React from 'react';
import { render, screen } from '@testing-library/react-native';
import VehiculeCaracteristiquesScreen from '../VehiculeCaracteristiquesScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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

const BASE_PROPS = {
  nom:             'Nen Dow',
  immatriculation: 'RC-001-GN',
  type:            'Camion',
  capacite:        500,
  role:            'livreur' as const,
  is_active:       true,
  en_livraison:    false,
  photo_url:       null,
};

describe('VehiculeCaracteristiquesScreen', () => {
  it('affiche le nom et l\'immatriculation du véhicule', () => {
    render(<VehiculeCaracteristiquesScreen {...BASE_PROPS} />);
    expect(screen.getByText('Nen Dow')).toBeTruthy();
    expect(screen.getAllByText('RC-001-GN').length).toBeGreaterThan(0);
  });

  it('affiche le badge Actif quand is_active=true', () => {
    render(<VehiculeCaracteristiquesScreen {...BASE_PROPS} is_active />);
    expect(screen.getByText('Actif')).toBeTruthy();
  });

  it('affiche le badge Inactif quand is_active=false', () => {
    render(<VehiculeCaracteristiquesScreen {...BASE_PROPS} is_active={false} />);
    expect(screen.getByText('Inactif')).toBeTruthy();
  });

  it('affiche Au repos quand en_livraison=false', () => {
    render(<VehiculeCaracteristiquesScreen {...BASE_PROPS} en_livraison={false} />);
    expect(screen.getByText('Au repos')).toBeTruthy();
  });

  it('affiche En livraison quand en_livraison=true', () => {
    render(<VehiculeCaracteristiquesScreen {...BASE_PROPS} en_livraison />);
    expect(screen.getByText('En livraison')).toBeTruthy();
  });

  it('affiche le type et la capacité dans la fiche', () => {
    render(<VehiculeCaracteristiquesScreen {...BASE_PROPS} />);
    expect(screen.getByText('Camion')).toBeTruthy();
    expect(screen.getByText('500 packs')).toBeTruthy();
  });

  it('affiche Propriétaire quand role=proprietaire', () => {
    render(<VehiculeCaracteristiquesScreen {...BASE_PROPS} role="proprietaire" />);
    expect(screen.getByText('Propriétaire')).toBeTruthy();
  });
});
