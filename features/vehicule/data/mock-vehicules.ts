export type StatutVehicule = 'actif' | 'inactif' | 'en_maintenance';

export interface Vehicule {
  id: string;
  nom: string;
  immatriculation: string;
  type: 'Camion' | 'Minibus' | 'Tricycle';
  capacite: number; // packs
  statut: StatutVehicule;
  gains: number;
}

export const MOCK_VEHICULES: Vehicule[] = [
  {
    id: '1',
    nom: 'Nen Dow',
    immatriculation: 'RC-001-GN',
    type: 'Camion',
    capacite: 500,
    statut: 'actif',
    gains: 270_000,
  },
  {
    id: '2',
    nom: 'Baba Ousou',
    immatriculation: 'VN-001-GN',
    type: 'Minibus',
    capacite: 150,
    statut: 'actif',
    gains: 0,
  },
  {
    id: '3',
    nom: 'Conakry 2',
    immatriculation: 'TC-002-GN',
    type: 'Tricycle',
    capacite: 60,
    statut: 'actif',
    gains: 0,
  },
];

export const STATUT_VEHICULE_CONFIG: Record<StatutVehicule, { label: string; bg: string; text: string }> = {
  actif:          { label: 'Actif',          bg: '#dcfce7', text: '#16a34a' },
  inactif:        { label: 'Inactif',        bg: '#fee2e2', text: '#dc2626' },
  en_maintenance: { label: 'Maintenance',    bg: '#fef9c3', text: '#ca8a04' },
};

export const TYPE_ICONE: Record<Vehicule['type'], string> = {
  Camion:   '🚚',
  Minibus:  '🚐',
  Tricycle: '🛺',
};
