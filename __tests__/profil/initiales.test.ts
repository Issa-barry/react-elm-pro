import { getInitiales } from '@/shared/utils/initiales';

describe('getInitiales', () => {
  it('retourne les deux premières initiales en majuscules', () => {
    expect(getInitiales('Moussa', 'CAMARA')).toBe('MC');
  });

  it('retourne une seule initiale si le nom est absent', () => {
    expect(getInitiales('Ibra', null)).toBe('I');
    expect(getInitiales('Ibra', undefined)).toBe('I');
  });

  it('retourne une seule initiale si le prénom est absent', () => {
    expect(getInitiales(null, 'DIALLO')).toBe('D');
    expect(getInitiales(undefined, 'DIALLO')).toBe('D');
  });

  it('retourne ? si les deux sont absents', () => {
    expect(getInitiales(null, null)).toBe('?');
    expect(getInitiales(undefined, undefined)).toBe('?');
    expect(getInitiales('', '')).toBe('?');
  });

  it('ignore les espaces en début et fin', () => {
    expect(getInitiales('  Moussa  ', '  Camara  ')).toBe('MC');
  });

  it('met en majuscule les initiales en minuscules', () => {
    expect(getInitiales('alpha', 'beta')).toBe('AB');
  });

  it('gère un prénom en une seule lettre', () => {
    expect(getInitiales('A', 'Barry')).toBe('AB');
  });
});
