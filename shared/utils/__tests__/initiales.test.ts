import { getInitiales } from '../initiales';

describe('getInitiales', () => {
  it('retourne les initiales prénom + nom', () => {
    expect(getInitiales('Jean', 'Dupont')).toBe('JD');
  });

  it('gère prénom null', () => {
    expect(getInitiales(null, 'Dupont')).toBe('D');
  });

  it('gère nom null', () => {
    expect(getInitiales('Jean', null)).toBe('J');
  });

  it('retourne "?" si prénom et nom sont null', () => {
    expect(getInitiales(null, null)).toBe('?');
  });

  it('gère prénom undefined', () => {
    expect(getInitiales(undefined, 'Barry')).toBe('B');
  });

  it('gère les chaînes vides', () => {
    expect(getInitiales('', 'Dupont')).toBe('D');
  });

  it('met en majuscules', () => {
    expect(getInitiales('issa', 'barry')).toBe('IB');
  });

  it('retourne "?" si les deux sont vides', () => {
    expect(getInitiales('', '')).toBe('?');
  });
});
