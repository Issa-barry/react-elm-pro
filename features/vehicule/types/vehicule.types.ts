// Champs tels que retournés par elm-monolithe VehiculesController
export type RoleVehicule = 'proprietaire' | 'livreur';

export interface VehiculeApi {
  id: string;               // ULID
  nom: string;              // nom_vehicule côté backend
  immatriculation: string;
  type: string;             // label lisible : 'Camion' | 'Minibus' | 'Tricycle'
  capacite: number;         // capacite_packs côté backend
  is_active: boolean;
  photo_url: string | null;
  role: RoleVehicule;       // rôle de l'utilisateur sur ce véhicule
  en_livraison: boolean;    // true = actuellement en transit
}
