export type StatutLivraison = 'transit' | 'commande';

export interface LivraisonEnCours {
  id: string;
  reference: string;
  statut: StatutLivraison;
  statut_label: string;
  site_source: string;
  site_destination: string;
  vehicule: { nom: string; immatriculation: string; type: string; photo_url: string | null } | null;
  equipe_nom: string;
  date_depart: string | null;
  date_arrivee_prevue: string | null;
  nb_packs: number;
}
