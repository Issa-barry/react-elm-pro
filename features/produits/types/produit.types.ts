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
  is_critique: boolean;
  in_stock: boolean;
  is_low_stock: boolean;
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
  is_critique: boolean;
  image?: { uri: string; name: string; type: string } | null;
}

export interface AjusterStockData {
  augmenter?: number;
  diminuer?: number;
  motif?: string;
}

export interface ProduitsListResponse {
  data: Produit[];
}

export interface ProduitResponse {
  data: Produit;
}
