/**
 * Formate un montant en GNF avec des espaces réguliers entre les groupes de 3 chiffres.
 * Ex : 2955000 → "2 955 000 GNF"
 */
export function formatMontant(n: number): string {
  const parts = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${parts} GNF`;
}

/**
 * Formate une date YYYY-MM-DD en "28 Mai"
 */
export function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${Number.parseInt(day)} ${MOIS[Number.parseInt(month) - 1]}`;
}
