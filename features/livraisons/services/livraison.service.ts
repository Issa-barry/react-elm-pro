import { secureStorage } from '@/features/auth/services/secure-storage.service';
import type { ApiResult } from '@/features/auth/types/auth.types';
import type { LivraisonEnCours } from '../types/livraison.types';

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
    if (!res.ok) return { ok: false, error: json.message ?? 'Erreur serveur.' };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: 'Connexion impossible. Vérifiez votre réseau.' };
  }
}

const MOCK: LivraisonEnCours[] = [
  {
    id: 'mock-tr-1',
    reference: 'TR-00001-ABC',
    statut: 'transit',
    statut_label: 'Livraison en cours',
    site_source: 'Conakry',
    site_destination: 'Kindia',
    vehicule: { nom: 'Baba Ousou', immatriculation: 'VN-001-GN', type: 'Camion', photo_url: null },
    equipe_nom: 'Équipe Alpha',
    date_depart: new Date().toISOString().split('T')[0],
    date_arrivee_prevue: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    nb_packs: 150,
  },
];

export const livraisonService = {
  async getLivraisonsEnCours(): Promise<ApiResult<LivraisonEnCours[]>> {
    if (USE_MOCK) {
      await new Promise<void>(r => setTimeout(r, 700));
      return { ok: true, data: MOCK };
    }
    return authGet<LivraisonEnCours[]>('/api/livraisons/en-cours');
  },
};
