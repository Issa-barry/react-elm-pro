export interface FraisApi {
  id: string;
  date: string | null;
  montant: number;
  type_code: string;   // ex: 'carburant', 'reparation', 'entretien'
  type_label: string;  // ex: 'Carburant'
  statut: string;      // ex: 'approuve', 'en_attente', 'rejete'
  commentaire: string | null;
  mois: string;        // ex: 'Juin 2026'
}
