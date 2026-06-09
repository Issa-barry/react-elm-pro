export interface GainsParVehicule {
  vehicule_id: string;
  nom: string;
  immatriculation: string;
  total_brut: number;
  total_net: number;
  total_verse: number;
  total_restant: number;
  nb_commandes: number;
}

export interface GainsMine {
  total_brut: number;
  total_net: number;
  total_verse: number;
  total_restant: number;
  nb_commandes: number;
  par_vehicule: GainsParVehicule[];
}
