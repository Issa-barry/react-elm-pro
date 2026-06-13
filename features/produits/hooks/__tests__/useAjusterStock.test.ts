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

  // ── Exclusion mutuelle des champs ─────────────────────────────────────────

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

  // ── Direction exposée ─────────────────────────────────────────────────────

  it('direction est "" quand aucun champ n\'est saisi', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    expect(result.current.direction).toBe('');
  });

  it('direction est "augmenter" quand augmenter est saisi', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setAugmenter('10'); });
    expect(result.current.direction).toBe('augmenter');
  });

  it('direction est "diminuer" quand diminuer est saisi', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setDiminuer('5'); });
    expect(result.current.direction).toBe('diminuer');
  });

  // ── Réinitialisation du motif lors d'un changement de direction ───────────

  it('réinitialise le motif si invalide pour l\'augmentation (ex: perte)', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    // Diminuer → motif perte (valide pour diminution)
    act(() => { result.current.setDiminuer('5'); });
    act(() => { result.current.setMotifType('perte'); });
    expect(result.current.motifType).toBe('perte');
    // Passe à augmenter → perte n'est pas valide → réinitialise
    act(() => { result.current.setAugmenter('10'); });
    expect(result.current.motifType).toBe('');
  });

  it('réinitialise le motif si invalide pour la diminution (ex: apres_production)', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    // Augmenter → motif apres_production (valide pour augmentation)
    act(() => { result.current.setAugmenter('10'); });
    act(() => { result.current.setMotifType('apres_production'); });
    expect(result.current.motifType).toBe('apres_production');
    // Passe à diminuer → apres_production n'est pas valide → réinitialise
    act(() => { result.current.setDiminuer('5'); });
    expect(result.current.motifType).toBe('');
  });

  it('conserve le motif correction_stock lors d\'un changement de direction (motif commun)', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setAugmenter('10'); });
    act(() => { result.current.setMotifType('correction_stock'); });
    // Passe à diminuer → correction_stock est valide pour les deux
    act(() => { result.current.setDiminuer('5'); });
    expect(result.current.motifType).toBe('correction_stock');
  });

  it('conserve le motif autre lors d\'un changement de direction (motif commun)', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setAugmenter('10'); });
    act(() => { result.current.setMotifType('autre'); });
    act(() => { result.current.setDiminuer('5'); });
    expect(result.current.motifType).toBe('autre');
  });

  // ── Gestion du motif_detail ───────────────────────────────────────────────

  it('setMotifType efface motifDetail si différent de "autre"', () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setMotifType('autre'); });
    act(() => { result.current.setMotifDetail('raison libre'); });
    expect(result.current.motifDetail).toBe('raison libre');
    act(() => { result.current.setMotifType('correction_stock'); });
    expect(result.current.motifDetail).toBe('');
  });

  // ── Submit ────────────────────────────────────────────────────────────────

  it('submit appelle le service avec les bonnes données (augmenter)', async () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => {
      result.current.setAugmenter('15');
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
      result.current.setDiminuer('5');
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

  it('submit appelle le service avec motif_detail pour "autre"', async () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => {
      result.current.setDiminuer('5');
      result.current.setMotifType('autre');
      result.current.setMotifDetail('Casse lors du transport');
    });
    let ok = false;
    await act(async () => { ok = await result.current.submit(); });
    expect(ok).toBe(true);
    expect(mockAjusterStock).toHaveBeenCalledWith('p1', {
      diminuer: 5,
      motif_type: 'autre',
      motif_detail: 'Casse lors du transport',
    });
  });

  it('retourne false et active motifError si aucun motif sélectionné', async () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => { result.current.setAugmenter('10'); });
    let ok = true;
    await act(async () => { ok = await result.current.submit(); });
    expect(ok).toBe(false);
    expect(result.current.motifError).toBe(true);
  });

  it('retourne false et active motifDetailError si "autre" sans détail', async () => {
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => {
      result.current.setAugmenter('10');
      result.current.setMotifType('autre');
    });
    let ok = true;
    await act(async () => { ok = await result.current.submit(); });
    expect(ok).toBe(false);
    expect(result.current.motifDetailError).toBe(true);
  });

  it('retourne false et définit error si le service retourne { ok: false }', async () => {
    mockAjusterStock.mockResolvedValue({ ok: false, error: 'Stock insuffisant' });
    const { result } = renderHook(() => useAjusterStock(PRODUIT));
    act(() => {
      result.current.setDiminuer('999');
      result.current.setMotifType('perte');
    });
    let ok = true;
    await act(async () => { ok = await result.current.submit(); });
    expect(ok).toBe(false);
    expect(result.current.error).toBe('Stock insuffisant');
  });
});
