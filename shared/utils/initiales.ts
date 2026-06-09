/**
 * Retourne les initiales (max 2 lettres majuscules) depuis prénom + nom.
 * Gère les cas vides / null / undefined.
 */
export function getInitiales(prenom?: string | null, nom?: string | null): string {
  const p = prenom?.trim().charAt(0).toUpperCase() ?? '';
  const n = nom?.trim().charAt(0).toUpperCase() ?? '';
  return (p + n) || '?';
}
