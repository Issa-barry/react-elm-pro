// Données mockées — onglet Logistique

export type TransferStatus = 'en_chargement' | 'en_transit' | 'en_cours' | 'receptionne';

export interface LogisticsStat {
  id:    string;
  label: string;
  value: string;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

export interface Transfer {
  id:          string;
  reference:   string;
  origine:     string;
  destination: string;
  statut:      TransferStatus;
  vehicule:    string;
  date:        string;
  nbProduits:  number;
}

export const LOGISTICS_STATS: LogisticsStat[] = [
  { id: 'en_cours',   label: 'Transferts en cours',   value: '5', color: 'primary' },
  { id: 'chargement', label: 'En chargement',          value: '2', color: 'warning' },
  { id: 'transit',    label: 'En transit',             value: '3', color: 'primary' },
  { id: 'reception',  label: 'Réceptions en attente',  value: '4', color: 'danger'  },
];

export const TRANSFERS: Transfer[] = [
  { id: '1', reference: 'TRF-2026-001', origine: 'Entrepôt central', destination: 'Matoto',         statut: 'en_transit',    vehicule: 'Tricycle A', date: '2026-06-12', nbProduits: 3 },
  { id: '2', reference: 'TRF-2026-002', origine: 'Entrepôt central', destination: 'Conakry Centre', statut: 'en_chargement', vehicule: 'Camion B',   date: '2026-06-12', nbProduits: 5 },
  { id: '3', reference: 'TRF-2026-003', origine: 'Matoto',           destination: 'Dixinn',         statut: 'en_cours',      vehicule: 'Minibus C',  date: '2026-06-11', nbProduits: 2 },
  { id: '4', reference: 'TRF-2026-004', origine: 'Conakry Centre',   destination: 'Entrepôt',       statut: 'receptionne',   vehicule: 'Tricycle D', date: '2026-06-11', nbProduits: 4 },
  { id: '5', reference: 'TRF-2026-005', origine: 'Entrepôt central', destination: 'Kaloum',         statut: 'en_transit',    vehicule: 'Camion E',   date: '2026-06-10', nbProduits: 6 },
];

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  en_chargement: 'En chargement',
  en_transit:    'En transit',
  en_cours:      'En cours',
  receptionne:   'Réceptionné',
};
