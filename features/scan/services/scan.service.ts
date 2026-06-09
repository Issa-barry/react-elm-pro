import { secureStorage } from '@/features/auth/services/secure-storage.service';
import type { ApiResult } from '@/features/auth/types/auth.types';
import type { ClientScan, LivraisonScan, ScanResult, UserScan } from '../types/scan.types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const USE_MOCK = !BASE_URL;

async function authGet<T>(path: string): Promise<ApiResult<T>> {
  const token = await secureStorage.getToken();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await res.json();
    if (res.status === 401) return { ok: false, error: 'Session expirée. Reconnectez-vous.' };
    if (!res.ok)            return { ok: false, error: json.message ?? 'Introuvable.' };
    return { ok: true, data: (json.data ?? json) as T };
  } catch {
    return { ok: false, error: 'Connexion impossible. Vérifiez votre réseau.' };
  }
}

// ─── Mocks ───────────────────────────────────────────────────────────────────

const MOCK_USER: UserScan = {
  user_id: '1',
  nom_complet: 'Moussa SIDIBÉ',
  nom: 'SIDIBÉ',
  prenom: 'Moussa',
  phone: '+224621234567',
  ville: 'Conakry',
  quartier: 'Ratoma',
  roles: ['proprietaire'],
  vehicules: [
    { nom: 'Nen Dow',   immatriculation: 'RC-001-GN' },
    { nom: 'Conakry 2', immatriculation: 'TC-002-GN' },
  ],
};

const MOCK_CLIENT: ClientScan = {
  id: '1',
  reference: 'CLI-20260601-0001',
  nom_complet: 'Aminata DIALLO',
  nom: 'DIALLO',
  prenom: 'Aminata',
  raison_sociale: null,
  phone: '+224621000001',
  email: null,
  ville: 'Conakry',
  quartier: 'Ratoma',
  adresse: 'Cité Enco-5, villa 12',
  is_active: true,
};

const MOCK_COMMANDE: LivraisonScan = {
  type: 'commande',
  reference: 'VT-00001-ABC',
  statut: 'en_cours',
  statut_label: 'En cours',
  site_source: 'Site Conakry',
  client_nom: 'Aminata DIALLO',
  client_telephone: '+224621000001',
  client_adresse: 'Cité Enco-5, villa 12, Ratoma, Conakry',
  vehicule: { nom: 'Baba Ousou', immatriculation: 'VN-001-GN' },
  equipe_nom: 'Équipe Alpha',
  date_commande: new Date().toISOString().split('T')[0],
  nb_packs: 24,
  total: 480000,
};

const MOCK_TRANSFERT: LivraisonScan = {
  type: 'transfert',
  reference: 'TR-00001-XYZ',
  statut: 'transit',
  statut_label: 'Livraison en cours',
  site_source: 'Site Conakry',
  site_destination: 'Site Kindia',
  vehicule: { nom: 'Baba Ousou', immatriculation: 'VN-001-GN' },
  equipe_nom: 'Équipe Alpha',
  date_depart: new Date().toISOString().split('T')[0],
  date_arrivee_prevue: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  nb_packs: 150,
};

// ─── Détection du type de QR ─────────────────────────────────────────────────
type QrType = 'user' | 'client' | 'livraison';

function detectQrType(raw: string): QrType {
  const upper = raw.trim().toUpperCase();
  if (upper.startsWith('CLI-')) return 'client';
  if (upper.startsWith('VT-') || upper.startsWith('TR-')) return 'livraison';
  // URL encodant une livraison : https://…/scan/livraison/VT-xxxxx
  if (upper.includes('/SCAN/LIVRAISON/')) return 'livraison';
  return 'user';
}

function extractLivraisonRef(raw: string): string {
  const idx = raw.toUpperCase().indexOf('/SCAN/LIVRAISON/');
  if (idx !== -1) return raw.slice(idx + '/scan/livraison/'.length);
  return raw;
}

// ─── Résolution mock ─────────────────────────────────────────────────────────

async function scanMock(value: string, qrType: QrType): Promise<ApiResult<ScanResult>> {
  await new Promise<void>(r => setTimeout(r, 700));
  if (qrType === 'user')   return { ok: true, data: { type: 'user',   data: MOCK_USER } };
  if (qrType === 'client') return { ok: true, data: { type: 'client', data: MOCK_CLIENT } };
  const ref = extractLivraisonRef(value).toUpperCase();
  const mock = ref.startsWith('TR-') ? MOCK_TRANSFERT : MOCK_COMMANDE;
  return { ok: true, data: { type: 'livraison', data: mock } };
}

// ─── Résolution API ───────────────────────────────────────────────────────────

async function scanApi(value: string, qrType: QrType): Promise<ApiResult<ScanResult>> {
  if (qrType === 'livraison') {
    const ref = extractLivraisonRef(value);
    const res = await authGet<LivraisonScan>(`/api/v1/mobile/livraisons/scan/${encodeURIComponent(ref)}`);
    if (!res.ok) return res;
    return { ok: true, data: { type: 'livraison', data: res.data } };
  }
  if (qrType === 'client') {
    const res = await authGet<ClientScan>(`/api/v1/mobile/clients/scan/${encodeURIComponent(value)}`);
    if (!res.ok) return res;
    return { ok: true, data: { type: 'client', data: res.data } };
  }
  const res = await authGet<UserScan>(`/api/v1/mobile/users/scan/${value}`);
  if (!res.ok) return res;
  return { ok: true, data: { type: 'user', data: res.data } };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const scanService = {
  async scan(raw: string): Promise<ApiResult<ScanResult>> {
    const value   = raw.trim();
    const qrType  = detectQrType(value);
    return USE_MOCK ? scanMock(value, qrType) : scanApi(value, qrType);
  },
};
