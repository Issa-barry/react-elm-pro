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
  is_used: false,
};

describe('useAjusterStock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAjusterStock.mockResolvedValue({ ok: true, data: PRODUIT });
  });

  // ── Direction ─────────────────────────────────────────────────────────────

  it('direction est null par défaut', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    expect(result.current.direction).toBeNull();
  });

  it('setDirection met à jour la direction', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setDirection('augmenter'); });
    expect(result.current.direction).toBe('augmenter');
  });

  it('setDirection réinitialise quantite et motif', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setDirection('augmenter'); });
    act(() => { result.current.setQuantite('10'); });
    act(() => { result.current.setMotifType('apres_production'); });
    act(() => { result.current.setDirection('diminuer'); });
    expect(result.current.quantite).toBe('');
    expect(result.current.motifType).toBe('');
  });

  it('setDirection à null remet à zéro', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setDirection('augmenter'); });
    act(() => { result.current.setDirection(null); });
    expect(result.current.direction).toBeNull();
    expect(result.current.quantite).toBe('');
  });

  // ── Réinitialisation du motif lors d'un changement de direction ───────────

  it('réinitialise le motif si invalide pour la nouvelle direction (perte → augmenter)', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setDirection('diminuer'); });
    act(() => { result.current.setMotifType('perte'); });
    expect(result.current.motifType).toBe('perte');
    act(() => { result.current.setDirection('augmenter'); });
    expect(result.current.motifType).toBe('');
  });

  it('réinitialise le motif si invalide (apres_production → diminuer)', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setDirection('augmenter'); });
    act(() => { result.current.setMotifType('apres_production'); });
    act(() => { result.current.setDirection('diminuer'); });
    expect(result.current.motifType).toBe('');
  });

  it('conserve correction_stock lors d\'un changement de direction (motif commun)', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setDirection('augmenter'); });
    act(() => { result.current.setMotifType('correction_stock'); });
    act(() => { result.current.setDirection('diminuer'); });
    expect(result.current.motifType).toBe('correction_stock');
  });

  // ── stockPreview ──────────────────────────────────────────────────────────

  it('stockPreview est null sans direction', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    expect(result.current.stockPreview).toBeNull();
  });

  it('stockPreview calcule stock + quantite pour augmenter', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setDirection('augmenter'); });
    act(() => { result.current.setQuantite('20'); });
    expect(result.current.stockPreview).toBe(70); // 50 + 20
  });

  it('stockPreview calcule stock - quantite pour diminuer', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setDirection('diminuer'); });
    act(() => { result.current.setQuantite('30'); });
    expect(result.current.stockPreview).toBe(20); // 50 - 30
  });

  // ── Submit ────────────────────────────────────────────────────────────────

  it('submit appelle le service avec les bonnes données (augmenter)', async () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => {
      result.current.setDirection('augmenter');
      result.current.setQuantite('15');
      result.current.setMotifType('apres_production');
    });
    let ok = false;
    await act(async () => { ok = await result.current.submit(); });
    expect(ok).toBe(true);
    expect(mockAjusterStock).toHaveBeenCalledWith('p1', {
      augmenter: 15,
      motif_type: 'apres_production',
    });
  });

  it('submit appelle le service avec les bonnes données (diminuer)', async () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => {
      result.current.setDirection('diminuer');
      result.current.setQuantite('5');
      result.current.setMotifType('perte');
    });
    let ok = false;
    await act(async () => { ok = await result.current.submit(); });
    expect(ok).toBe(true);
    expect(mockAjusterStock).toHaveBeenCalledWith('p1', {
      diminuer: 5,
      motif_type: 'perte',
    });
  });

  it('retourne false et active quantiteError si quantite vide', async () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => {
      result.current.setDirection('augmenter');
      result.current.setMotifType('apres_production');
    });
    let ok = true;
    await act(async () => { ok = await result.current.submit(); });
    expect(ok).toBe(false);
    expect(result.current.quantiteError).toBe(true);
  });

  it('retourne false et active motifError si aucun motif sélectionné', async () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => {
      result.current.setDirection('augmenter');
      result.current.setQuantite('10');
    });
    let ok = true;
    await act(async () => { ok = await result.current.submit(); });
    expect(ok).toBe(false);
    expect(result.current.motifError).toBe(true);
  });

  it('retourne false et définit error si le service retourne { ok: false }', async () => {
    mockAjusterStock.mockResolvedValue({ ok: false, error: 'Stock insuffisant' });
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => {
      result.current.setDirection('diminuer');
      result.current.setQuantite('999');
      result.current.setMotifType('perte');
    });
    let ok = true;
    await act(async () => { ok = await result.current.submit(); });
    expect(ok).toBe(false);
    expect(result.current.error).toBe('Stock insuffisant');
  });
});
