import type { ApiResult } from '@/features/auth/types/auth.types';

export type { ApiResult };

export interface Produit {
  id: string;
  nom: string;
  code_interne: string | null;
  code_fournisseur: string | null;
  type: 'materiel' | 'service' | 'fabricable' | 'achat_vente' | null;
  type_label: string | null;
  type_has_stock: boolean;
  statut: 'actif' | 'inactif' | 'archive' | null;
  statut_label: string | null;
  prix_usine: number | null;
  prix_vente: number | null;
  prix_achat: number | null;
  cout: number | null;
  qte_stock: number | null;
  seuil_alerte_stock: number | null;
  description: string | null;
  image_url: string | null;
  is_alerte: boolean;
  in_stock: boolean;
  is_low_stock: boolean;
  is_used: boolean;
  archived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProduitFormData {
  nom: string;
  code_fournisseur: string;
  type: string;
  statut: string;
  prix_vente: string;
  prix_achat: string;
  prix_usine: string;
  cout: string;
  qte_stock: string;
  seuil_alerte_stock: string;
  description: string;
  is_alerte: boolean;
  image?: { uri: string; name: string; type: string } | null;
}

export type MotifAjustementStock =
  | 'apres_production'
  | 'retour'
  | 'entree_exceptionnelle'
  | 'perte'
  | 'casse'
  | 'don'
  | 'sortie_exceptionnelle'
  | 'correction_stock';

export interface MotifOption {
  label: string;
  value: MotifAjustementStock;
}

export const MOTIFS_AUGMENTATION: MotifOption[] = [
  { label: 'Après production',      value: 'apres_production' },
  { label: 'Retour',                value: 'retour' },
  { label: 'Correction de stock',   value: 'correction_stock' },
  { label: 'Entrée exceptionnelle', value: 'entree_exceptionnelle' },
];

export const MOTIFS_DIMINUTION: MotifOption[] = [
  { label: 'Perte',                 value: 'perte' },
  { label: 'Casse',                 value: 'casse' },
  { label: 'Don',                   value: 'don' },
  { label: 'Correction de stock',   value: 'correction_stock' },
  { label: 'Sortie exceptionnelle', value: 'sortie_exceptionnelle' },
];

export interface AjusterStockData {
  augmenter?: number;
  diminuer?: number;
  motif_type: MotifAjustementStock;
}

export interface MouvementStock {
  id: string;
  type: 'entree' | 'sortie';
  quantite: number;
  stock_avant: number;
  stock_apres: number;
  notes: string | null;
  createur: string | null;
  created_at: string;
  is_initial?: boolean;
}

export interface AuditEntry {
  id: string;
  event_code: string;
  event_label: string;
  actor_name: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}

export interface ProduitHistoriqueResponse {
  mouvements: MouvementStock[];
  historique: AuditEntry[];
}

export interface ProduitsListResponse {
  data: Produit[];
}

export interface ProduitResponse {
  data: Produit;
}
