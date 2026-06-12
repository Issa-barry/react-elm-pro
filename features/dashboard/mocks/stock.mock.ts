// Données mockées — onglet Stock
// Remplacer les valeurs statiques par des appels API quand disponible.

export type StockAlertType = 'rupture' | 'faible';
export type MouvementType  = 'entree'  | 'sortie';

export interface StockStat {
  id:    string;
  label: string;
  value: string;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

export interface StockAlert {
  id:      string;
  produit: string;
  code:    string;
  qte:     number;
  seuil:   number;
  type:    StockAlertType;
}

export interface MouvementStock {
  id:       string;
  produit:  string;
  type:     MouvementType;
  quantite: number;
  date:     string;
  motif:    string;
}

export const STOCK_STATS: StockStat[] = [
  { id: 'actifs',  label: 'Produits actifs',  value: '47',        color: 'primary' },
  { id: 'rupture', label: 'En rupture',        value: '3',         color: 'danger'  },
  { id: 'faible',  label: 'Stock faible',      value: '8',         color: 'warning' },
  { id: 'valeur',  label: 'Valeur du stock',   value: '18,4 M GNF', color: 'success' },
];

export const STOCK_ALERTS: StockAlert[] = [
  { id: '1', produit: 'Pack 350ml',    code: '20260611-001', qte: 0,   seuil: 100, type: 'rupture' },
  { id: '2', produit: 'Bouteille 1L',  code: '20260611-002', qte: 45,  seuil: 200, type: 'faible'  },
  { id: '3', produit: 'Pack 6 btes',   code: '20260611-003', qte: 80,  seuil: 150, type: 'faible'  },
  { id: '4', produit: 'Btle 0.5L',     code: '20260611-004', qte: 0,   seuil: 500, type: 'rupture' },
  { id: '5', produit: 'Pack 1.5L',     code: '20260611-005', qte: 120, seuil: 300, type: 'faible'  },
];

export const MOUVEMENTS_STOCK: MouvementStock[] = [
  { id: '1', produit: 'Pack 350ml',    type: 'sortie', quantite: 50,  date: '2026-06-12', motif: 'Livraison'       },
  { id: '2', produit: 'Bouteille 1L',  type: 'entree', quantite: 200, date: '2026-06-12', motif: 'Après production' },
  { id: '3', produit: 'Pack 6 btes',   type: 'sortie', quantite: 30,  date: '2026-06-11', motif: 'Livraison'       },
  { id: '4', produit: 'Btle 0.5L',     type: 'entree', quantite: 500, date: '2026-06-11', motif: 'Après production' },
  { id: '5', produit: 'Pack 1.5L',     type: 'sortie', quantite: 80,  date: '2026-06-10', motif: 'Correction'      },
];
