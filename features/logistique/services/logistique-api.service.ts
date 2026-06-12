import { secureStorage } from '@/features/auth/services/secure-storage.service';
import type { ApiResult } from '@/features/auth/types/auth.types';
import type { Commission, Transfert } from '../types/logistique.types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

async function headers(): Promise<Record<string, string>> {
  const token = await secureStorage.getToken();
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function parseError(json: Record<string, unknown>, fallback: string): string {
  if (json.errors && typeof json.errors === 'object') {
    return Object.values(json.errors as Record<string, string[]>)
      .flat()
      .join(' ');
  }
  return (json.message as string) ?? fallback;
}

export async function fetchTransferts(params?: {
  statut?: string;
  search?: string;
}): Promise<ApiResult<Transfert[]>> {
  try {
    const qs = new URLSearchParams();
    if (params?.statut) qs.set('statut', params.statut);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await fetch(`${API_URL}/api/v1/backoffice/logistique/transferts${query}`, {
      headers: await headers(),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: parseError(json, 'Erreur chargement transferts') };
    return { ok: true, data: Array.isArray(json) ? json : (json.data ?? []) };
  } catch {
    return { ok: false, error: 'Erreur réseau' };
  }
}

export async function fetchTransfert(id: string): Promise<ApiResult<Transfert>> {
  try {
    const res = await fetch(`${API_URL}/api/v1/backoffice/logistique/transferts/${id}`, {
      headers: await headers(),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: parseError(json, 'Erreur chargement transfert') };
    return { ok: true, data: json.data ?? json };
  } catch {
    return { ok: false, error: 'Erreur réseau' };
  }
}

export async function saisirReception(
  id: string,
  lignes: { id: string; quantite_recue: number; ecart_type: string; ecart_motif?: string }[]
): Promise<ApiResult<Transfert>> {
  try {
    const res = await fetch(`${API_URL}/api/v1/backoffice/logistique/transferts/${id}/reception`, {
      method: 'PUT',
      headers: await headers(),
      body: JSON.stringify({ lignes }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: parseError(json, 'Erreur saisie réception') };
    return { ok: true, data: json.data ?? json };
  } catch {
    return { ok: false, error: 'Erreur réseau' };
  }
}

export async function validerReception(id: string): Promise<ApiResult<Transfert>> {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/backoffice/logistique/transferts/${id}/valider-reception`,
      { method: 'POST', headers: await headers() }
    );
    const json = await res.json();
    if (!res.ok) return { ok: false, error: parseError(json, 'Erreur validation réception') };
    return { ok: true, data: json.data ?? json };
  } catch {
    return { ok: false, error: 'Erreur réseau' };
  }
}

export async function validationAdmin(
  id: string,
  data: { decision: 'accord' | 'refus' | 'invalider'; motif?: string; montant_par_pack?: number }
): Promise<ApiResult<Transfert>> {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/backoffice/logistique/transferts/${id}/validation-admin`,
      { method: 'POST', headers: await headers(), body: JSON.stringify(data) }
    );
    const json = await res.json();
    if (!res.ok) return { ok: false, error: parseError(json, 'Erreur validation admin') };
    return { ok: true, data: json.data ?? json };
  } catch {
    return { ok: false, error: 'Erreur réseau' };
  }
}

export async function fetchCommissions(): Promise<ApiResult<Commission[]>> {
  try {
    const res = await fetch(`${API_URL}/api/v1/backoffice/logistique/commissions`, {
      headers: await headers(),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: parseError(json, 'Erreur chargement commissions') };
    return { ok: true, data: Array.isArray(json) ? json : (json.data ?? []) };
  } catch {
    return { ok: false, error: 'Erreur réseau' };
  }
}

export async function fetchCommission(id: string): Promise<ApiResult<Commission>> {
  try {
    const res = await fetch(`${API_URL}/api/v1/backoffice/logistique/commissions/${id}`, {
      headers: await headers(),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: parseError(json, 'Erreur chargement commission') };
    return { ok: true, data: json.data ?? json };
  } catch {
    return { ok: false, error: 'Erreur réseau' };
  }
}
