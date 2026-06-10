import { act, renderHook } from '@testing-library/react-native';
import { useAjusterStock } from '../useAjusterStock';
import * as api from '../../services/produits-api.service';
import type { Produit } from '../../types/produit.types';

jest.mock('../../services/produits-api.service');

const mockAjusterStock = api.ajusterStock as jest.MockedFunction<typeof api.ajusterStock>;

const PRODUIT: Produit = {
  id: 'p1',
  nom: 'Eau 1.5L',
  code_interne: null,
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
  qte_stock: 50,
  seuil_alerte_stock: 5,
  description: null,
  image_url: null,
  is_alerte: false,
  in_stock: true,
  is_low_stock: false,
  archived_at: null,
  created_at: null,
  updated_at: null,
};

describe('useAjusterStock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAjusterStock.mockResolvedValue({ ok: true, data: PRODUIT });
  });

  it('setAugmenter efface diminuer', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));

    act(() => { result.current.setDiminuer('10'); });
    expect(result.current.diminuer).toBe('10');

    act(() => { result.current.setAugmenter('5'); });
    expect(result.current.augmenter).toBe('5');
    expect(result.current.diminuer).toBe('');
  });

  it('setDiminuer efface augmenter', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));

    act(() => { result.current.setAugmenter('20'); });
    expect(result.current.augmenter).toBe('20');

    act(() => { result.current.setDiminuer('8'); });
    expect(result.current.diminuer).toBe('8');
    expect(result.current.augmenter).toBe('');
  });

  it('submit appelle le service avec les bonnes données (augmenter)', async () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => {
      result.current.setAugmenter('15');
      result.current.setMotif('Réapprovisionnement');
    });

    let ok = false;
    await act(async () => { ok = await result.current.submit(); });

    expect(ok).toBe(true);
    expect(mockAjusterStock).toHaveBeenCalledWith('p1', {
      augmenter: 15,
      motif: 'Réapprovisionnement',
    });
  });

  it('submit appelle le service avec les bonnes données (diminuer)', async () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setDiminuer('5'); });

    await act(async () => { await result.current.submit(); });

    expect(mockAjusterStock).toHaveBeenCalledWith('p1', { diminuer: 5 });
  });

  it('retourne false et définit error si le service retourne { ok: false }', async () => {
    mockAjusterStock.mockResolvedValue({ ok: false, error: 'Stock insuffisant' });
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setDiminuer('999'); });

    let ok = true;
    await act(async () => { ok = await result.current.submit(); });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('Stock insuffisant');
  });
});
