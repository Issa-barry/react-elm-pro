export type StatutTransfert =
  | 'brouillon'
  | 'chargement'
  | 'transit'
  | 'reception'
  | 'cloture'
  | 'annule';

export type TypeEcart = 'conforme' | 'casse' | 'perte' | 'surplus' | 'manquant';
export type StatutCommission = 'impaye' | 'partiel' | 'paye';

export interface TransfertLigne {
  id: string;
  produit_id: string;
  produit_nom: string | null;
  produit_code: string | null;
  produit_image_url: string | null;
  quantite_demandee: number;
  quantite_chargee: number | null;
  quantite_recue: number | null;
  ecart_type: TypeEcart | null;
  ecart_label: string;
  ecart: number | null;
  ecart_motif: string | null;
  reception_complete: boolean;
}

export interface CommissionPart {
  id: string;
  type_beneficiaire: 'livreur' | 'proprietaire';
  beneficiaire_nom: string;
  taux_commission: number;
  montant_brut: number;
  montant_net: number;
  montant_verse: number;
  montant_restant: number;
  statut: StatutCommission;
  statut_label: string;
}

export interface Commission {
  id: string;
  base_calcul: 'forfait' | 'par_pack' | 'par_km';
  valeur_base: number;
  quantite_reference: number | null;
  montant_total: number;
  montant_verse: number;
  montant_restant: number;
  statut: StatutCommission;
  statut_label: string;
  parts: CommissionPart[];
}

export interface Transfert {
  id: string;
  reference: string;
  statut: StatutTransfert;
  statut_label: string;
  statut_color: string;
  site_source: { id: string; nom: string };
  site_destination: { id: string; nom: string };
  vehicule: { id: string; nom_vehicule: string; immatriculation: string } | null;
  equipe: { id: string; nom: string } | null;
  date_depart_prevue: string | null;
  date_depart_reelle: string | null;
  date_arrivee_prevue: string | null;
  date_arrivee_reelle: string | null;
  notes: string | null;
  nb_packs_demandes: number | null;
  nb_packs_charges: number | null;
  nb_packs_recus: number | null;
  lignes: TransfertLigne[];
  validation_reception: 'accord' | 'refus' | null;
  validation_motif: string | null;
  commission: Commission | null;
  created_at: string;
}
