import { act, renderHook } from '@testing-library/react-native';
import { useProduits } from '../useProduits';
import * as api from '../../services/produits-api.service';
import type { Produit } from '../../types/produit.types';

jest.mock('../../services/produits-api.service');

const mockFetchProduits = api.fetchProduits as jest.MockedFunction<typeof api.fetchProduits>;

const PRODUIT: Produit = {
  id: 'p1',
  nom: 'Eau 1.5L',
  code_interne: 'EAU-001',
  code_fournisseur: null,
  type: 'achat_vente',
  type_label: 'Achat/Vente',
  type_has_stock: true,
  statut: 'actif',
  statut_label: 'Actif',
  prix_usine: null,
  prix_vente: 5000,
  prix_achat: 3000,
  cout: null,
  qte_stock: 100,
  seuil_alerte_stock: 10,
  description: null,
  image_url: null,
  is_critique: false,
  in_stock: true,
  is_low_stock: false,
  archived_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('useProduits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchProduits.mockResolvedValue([]);
  });

  it('démarre avec un tableau vide et loading=false', () => {
    const { result } = renderHook(() => useProduits());
    expect(result.current.produits).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('charge les produits avec succès', async () => {
    mockFetchProduits.mockResolvedValue([PRODUIT]);
    const { result } = renderHook(() => useProduits());

    await act(async () => { await result.current.reload(); });

    expect(result.current.produits).toEqual([PRODUIT]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('définit error si le service lève une exception', async () => {
    mockFetchProduits.mockRejectedValue(new Error('Réseau'));
    const { result } = renderHook(() => useProduits());

    await act(async () => { await result.current.reload(); });

    expect(result.current.error).toBe('Impossible de charger les produits.');
    expect(result.current.loading).toBe(false);
  });

  it('reload() re-exécute le chargement', async () => {
    mockFetchProduits.mockResolvedValue([]);
    const { result } = renderHook(() => useProduits());
    await act(async () => { await result.current.reload(); });

    mockFetchProduits.mockResolvedValue([PRODUIT]);
    await act(async () => { await result.current.reload(); });

    expect(result.current.produits).toEqual([PRODUIT]);
    expect(mockFetchProduits).toHaveBeenCalledTimes(3); // 1 from useEffect + 2 from reload
  });
});
