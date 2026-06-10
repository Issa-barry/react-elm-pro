import { secureStorage } from '@/features/auth/services/secure-storage.service';
import type { ApiResult } from '@/features/auth/types/auth.types';
import type { AjusterStockData, Produit, ProduitFormData } from '../types/produit.types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

async function headers(): Promise<Record<string, string>> {
  const token = await secureStorage.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function headersMultipart(): Promise<Record<string, string>> {
  const token = await secureStorage.getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function parseValidationErrors(errors: Record<string, string[]>): string {
  return Object.values(errors)
    .flat()
    .join(' ');
}

export async function fetchProduits(): Promise<Produit[]> {
  const res = await fetch(`${API_URL}/api/v1/backoffice/produits`, {
    headers: await headers(),
  });
  if (!res.ok) throw new Error('Erreur chargement produits');
  const json = await res.json();
  // Support both wrapped { data: [] } and bare []
  return Array.isArray(json) ? json : (json.data ?? []);
}

export async function fetchProduit(id: string): Promise<Produit> {
  const res = await fetch(`${API_URL}/api/v1/backoffice/produits/${id}`, {
    headers: await headers(),
  });
  if (!res.ok) throw new Error('Erreur chargement produit');
  const json = await res.json();
  return json.data ?? json;
}

export async function createProduit(data: ProduitFormData): Promise<ApiResult<Produit>> {
  try {
    if (data.image) {
      const formData = new FormData();
      formData.append('nom', data.nom);
      if (data.code_fournisseur) formData.append('code_fournisseur', data.code_fournisseur);
      if (data.type) formData.append('type', data.type);
      if (data.statut) formData.append('statut', data.statut);
      if (data.prix_vente) formData.append('prix_vente', data.prix_vente);
      if (data.prix_achat) formData.append('prix_achat', data.prix_achat);
      if (data.prix_usine) formData.append('prix_usine', data.prix_usine);
      if (data.cout) formData.append('cout', data.cout);
      if (data.qte_stock) formData.append('qte_stock', data.qte_stock);
      if (data.seuil_alerte_stock) formData.append('seuil_alerte_stock', data.seuil_alerte_stock);
      if (data.description) formData.append('description', data.description);
      formData.append('is_critique', data.is_critique ? '1' : '0');
      formData.append('image', data.image as unknown as Blob);

      const res = await fetch(`${API_URL}/api/v1/backoffice/produits`, {
        method: 'POST',
        headers: await headersMultipart(),
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 422 && json.errors) {
          return { ok: false, error: parseValidationErrors(json.errors) };
        }
        return { ok: false, error: json.message ?? 'Erreur création produit' };
      }
      return { ok: true, data: json.data ?? json };
    }

    const body: Record<string, unknown> = {
      nom: data.nom,
      is_critique: data.is_critique,
    };
    if (data.code_fournisseur) body.code_fournisseur = data.code_fournisseur;
    if (data.type) body.type = data.type;
    if (data.statut) body.statut = data.statut;
    if (data.prix_vente) body.prix_vente = data.prix_vente;
    if (data.prix_achat) body.prix_achat = data.prix_achat;
    if (data.prix_usine) body.prix_usine = data.prix_usine;
    if (data.cout) body.cout = data.cout;
    if (data.qte_stock) body.qte_stock = data.qte_stock;
    if (data.seuil_alerte_stock) body.seuil_alerte_stock = data.seuil_alerte_stock;
    if (data.description) body.description = data.description;

    const res = await fetch(`${API_URL}/api/v1/backoffice/produits`, {
      method: 'POST',
      headers: await headers(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      if (res.status === 422 && json.errors) {
        return { ok: false, error: parseValidationErrors(json.errors) };
      }
      return { ok: false, error: json.message ?? 'Erreur création produit' };
    }
    return { ok: true, data: json.data ?? json };
  } catch {
    return { ok: false, error: 'Erreur réseau' };
  }
}

export async function updateProduit(id: string, data: ProduitFormData): Promise<ApiResult<Produit>> {
  try {
    if (data.image) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('nom', data.nom);
      if (data.code_fournisseur) formData.append('code_fournisseur', data.code_fournisseur);
      if (data.type) formData.append('type', data.type);
      if (data.statut) formData.append('statut', data.statut);
      if (data.prix_vente) formData.append('prix_vente', data.prix_vente);
      if (data.prix_achat) formData.append('prix_achat', data.prix_achat);
      if (data.prix_usine) formData.append('prix_usine', data.prix_usine);
      if (data.cout) formData.append('cout', data.cout);
      if (data.qte_stock) formData.append('qte_stock', data.qte_stock);
      if (data.seuil_alerte_stock) formData.append('seuil_alerte_stock', data.seuil_alerte_stock);
      if (data.description) formData.append('description', data.description);
      formData.append('is_critique', data.is_critique ? '1' : '0');
      formData.append('image', data.image as unknown as Blob);

      const res = await fetch(`${API_URL}/api/v1/backoffice/produits/${id}`, {
        method: 'POST',
        headers: await headersMultipart(),
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 422 && json.errors) {
          return { ok: false, error: parseValidationErrors(json.errors) };
        }
        return { ok: false, error: json.message ?? 'Erreur modification produit' };
      }
      return { ok: true, data: json.data ?? json };
    }

    const body: Record<string, unknown> = {
      nom: data.nom,
      is_critique: data.is_critique,
    };
    if (data.code_fournisseur) body.code_fournisseur = data.code_fournisseur;
    if (data.type) body.type = data.type;
    if (data.statut) body.statut = data.statut;
    if (data.prix_vente) body.prix_vente = data.prix_vente;
    if (data.prix_achat) body.prix_achat = data.prix_achat;
    if (data.prix_usine) body.prix_usine = data.prix_usine;
    if (data.cout) body.cout = data.cout;
    if (data.qte_stock) body.qte_stock = data.qte_stock;
    if (data.seuil_alerte_stock) body.seuil_alerte_stock = data.seuil_alerte_stock;
    if (data.description) body.description = data.description;

    const res = await fetch(`${API_URL}/api/v1/backoffice/produits/${id}`, {
      method: 'PUT',
      headers: await headers(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      if (res.status === 422 && json.errors) {
        return { ok: false, error: parseValidationErrors(json.errors) };
      }
      return { ok: false, error: json.message ?? 'Erreur modification produit' };
    }
    return { ok: true, data: json.data ?? json };
  } catch {
    return { ok: false, error: 'Erreur réseau' };
  }
}

export async function deleteProduit(id: string): Promise<ApiResult<void>> {
  try {
    const res = await fetch(`${API_URL}/api/v1/backoffice/produits/${id}`, {
      method: 'DELETE',
      headers: await headers(),
    });
    if (!res.ok) {
      let json: { message?: string } = {};
      try { json = await res.json(); } catch { /* empty */ }
      return { ok: false, error: json.message ?? 'Erreur suppression produit' };
    }
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: 'Erreur réseau' };
  }
}

export async function ajusterStock(id: string, data: AjusterStockData): Promise<ApiResult<Produit>> {
  try {
    const res = await fetch(`${API_URL}/api/v1/backoffice/produits/${id}/ajuster-stock`, {
      method: 'POST',
      headers: await headers(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      if (res.status === 422 && json.errors) {
        return { ok: false, error: parseValidationErrors(json.errors) };
      }
      return { ok: false, error: json.message ?? 'Erreur ajustement stock' };
    }
    return { ok: true, data: json.data ?? json };
  } catch {
    return { ok: false, error: 'Erreur réseau' };
  }
}
