export interface ClientScan {
  id: string;
  reference: string;
  nom_complet: string;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  phone: string | null;
  email: string | null;
  ville: string | null;
  quartier: string | null;
  adresse: string | null;
  is_active: boolean;
}

export type RoleScan = 'proprietaire' | 'livreur';

export interface VehiculeResume {
  nom: string;
  immatriculation: string;
}

export interface UserScan {
  user_id: string;
  nom_complet: string;
  nom: string;
  prenom: string | null;
  phone: string | null;
  ville: string | null;
  quartier: string | null;
  roles: RoleScan[];
  vehicules: VehiculeResume[];
}

export interface LivraisonScan {
  type: 'commande' | 'transfert';
  reference: string;
  statut: string;
  statut_label: string;
  // commande uniquement
  site_source?: string;
  client_nom?: string;
  client_telephone?: string | null;
  client_adresse?: string | null;
  // transfert uniquement
  site_destination?: string;
  date_depart?: string | null;
  date_arrivee_prevue?: string | null;
  // commun
  vehicule?: { nom: string; immatriculation: string } | null;
  equipe_nom?: string;
  nb_packs?: number;
  total?: number | null;
  date_commande?: string | null;
}

export type ScanResult =
  | { type: 'user';      data: UserScan }
  | { type: 'client';    data: ClientScan }
  | { type: 'livraison'; data: LivraisonScan };
