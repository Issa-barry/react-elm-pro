import { formatDate, formatMontant } from '../format';

// Normalise tous les types d'espaces (U+0020, U+00A0, U+202F) en espace ordinaire
// pour que les assertions soient indépendantes du séparateur exact utilisé.
const ns = (s: string) => s.replace(/[    ]/g, ' ');

describe('formatMontant', () => {
  it('formate un montant avec separateurs de milliers', () => {
    expect(ns(formatMontant(2955000))).toBe('2 955 000 GNF');
  });

  it('formate un montant inferieur a 1000 sans separateur', () => {
    expect(ns(formatMontant(500))).toBe('500 GNF');
  });

  it('formate zero', () => {
    expect(ns(formatMontant(0))).toBe('0 GNF');
  });

  it('arrondit les decimales', () => {
    expect(ns(formatMontant(1000.7))).toBe('1 001 GNF');
    expect(ns(formatMontant(1000.2))).toBe('1 000 GNF');
  });

  it('formate un million', () => {
    expect(ns(formatMontant(1000000))).toBe('1 000 000 GNF');
  });

  it('formate 1000 exactement', () => {
    expect(ns(formatMontant(1000))).toBe('1 000 GNF');
  });

  it('se termine toujours par GNF', () => {
    expect(formatMontant(42)).toMatch(/GNF$/);
    expect(formatMontant(0)).toMatch(/GNF$/);
  });
});

describe('formatDate', () => {
  it('formate une date YYYY-MM-DD en jour + mois abrege', () => {
    expect(formatDate('2026-05-28')).toBe('28 Mai');
  });

  it('formate le premier mois (Janvier)', () => {
    expect(formatDate('2026-01-01')).toBe('1 Jan');
  });

  it('formate le dernier mois (Decembre)', () => {
    expect(formatDate('2026-12-31')).toBe('31 Déc');
  });

  it('formate tous les mois correctement', () => {
    const cas: [string, string][] = [
      ['2026-01-15', '15 Jan'],
      ['2026-02-10', '10 Fév'],
      ['2026-03-05', '5 Mar'],
      ['2026-04-20', '20 Avr'],
      ['2026-05-01', '1 Mai'],
      ['2026-06-30', '30 Juin'],
      ['2026-07-14', '14 Juil'],
      ['2026-08-08', '8 Aoû'],
      ['2026-09-22', '22 Sep'],
      ['2026-10-11', '11 Oct'],
      ['2026-11-03', '3 Nov'],
      ['2026-12-25', '25 Déc'],
    ];
    cas.forEach(([input, expected]) => {
      expect(formatDate(input)).toBe(expected);
    });
  });

  it('supprime le zero de tete du jour', () => {
    expect(formatDate('2026-06-04')).toBe('4 Juin');
  });
});
