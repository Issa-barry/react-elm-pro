import React from 'react';
import { render, screen } from '@testing-library/react-native';
import GainsScreen from '../GainsScreen';

jest.mock('@/shared/components/themed-text', () => {
  const R = require('react');
  return { ThemedText: ({ children }: { children: unknown }) => R.createElement('Text', null, children) };
});

jest.mock('@/shared/components/themed-view', () => {
  const R = require('react');
  return { ThemedView: ({ children }: { children: unknown }) => R.createElement('View', null, children) };
});

describe('GainsScreen', () => {
  it('affiche le titre Gains', () => {
    render(<GainsScreen />);
    expect(screen.getByText('Gains')).toBeTruthy();
  });

  it('affiche le message placeholder', () => {
    render(<GainsScreen />);
    expect(screen.getByText('Vos gains apparaîtront ici.')).toBeTruthy();
  });
});
