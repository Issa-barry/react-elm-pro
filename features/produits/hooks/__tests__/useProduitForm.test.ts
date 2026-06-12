import { act, renderHook } from '@testing-library/react-native';
import { useProduitForm } from '../useProduitForm';
import * as api from '../../services/produits-api.service';
import type { Produit } from '../../types/produit.types';

jest.mock('../../services/produits-api.service');

const mockCreate = api.createProduit as jest.MockedFunction<typeof api.createProduit>;
const mockUpdate = api.updateProduit as jest.MockedFunction<typeof api.updateProduit>;

const PRODUIT: Produit = {
  id: 'p1',
  nom: 'Eau 1.5L',
  code_interne: 'EAU-001',
  code_fournisseur: 'FOURN-42',
  type: 'achat_vente',
  type_label: 'Achat/Vente',
  type_has_stock: true,
  statut: 'actif',
  statut_label: 'Actif',
  prix_usine: 2000,
  prix_vente: 5000,
  prix_achat: 3000,
  cout: 2500,
  qte_stock: 100,
  seuil_alerte_stock: 10,
  description: 'Bouteille eau minérale',
  image_url: null,
  is_alerte: true,
  in_stock: true,
  is_low_stock: false,
  archived_at: null,
  created_at: null,
  updated_at: null,
  is_used: false,
};

describe('useProduitForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({ ok: true, data: PRODUIT });
    mockUpdate.mockResolvedValue({ ok: true, data: PRODUIT });
  });

  it('initialise avec les valeurs par défaut (mode création)', () => {
    const { result } = renderHook(() => useProduitForm());
    expect(result.current.form.nom).toBe('');
    expect(result.current.form.type).toBe('');
    expect(result.current.form.statut).toBe('');
    expect(result.current.form.is_alerte).toBe(false);
    expect(result.current.globalError).toBe('');
    expect(result.current.errors).toEqual({});
  });

  it('pré-remplit depuis un produit existant (mode édition)', () => {
    const { result } = renderHook(() => useProduitForm(PRODUIT));
    expect(result.current.form.nom).toBe('Eau 1.5L');
    expect(result.current.form.code_fournisseur).toBe('FOURN-42');
    expect(result.current.form.type).toBe('achat_vente');
    expect(result.current.form.statut).toBe('actif');
    expect(result.current.form.prix_vente).toBe('5000');
    expect(result.current.form.prix_achat).toBe('3000');
    expect(result.current.form.cout).toBe('2500');
    expect(result.current.form.qte_stock).toBe('100');
    expect(result.current.form.description).toBe('Bouteille eau minérale');
    expect(result.current.form.is_alerte).toBe(true);
  });

  it('setField met à jour le champ correspondant', () => {
    const { result } = renderHook(() => useProduitForm());
    act(() => { result.current.setField('nom', 'Jus de mangue'); });
    expect(result.current.form.nom).toBe('Jus de mangue');
  });

  it('submit appelle createProduit en mode création', async () => {
    const { result } = renderHook(() => useProduitForm());
    act(() => { result.current.setField('nom', 'Nouveau produit'); });

    await act(async () => { await result.current.submit(); });

    expect(mockCreate).toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('submit appelle updateProduit en mode édition', async () => {
    const { result } = renderHook(() => useProduitForm(PRODUIT));

    await act(async () => { await result.current.submit(); });

    expect(mockUpdate).toHaveBeenCalledWith('p1', expect.any(Object));
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('submit retourne { ok: true, produit } en cas de succès', async () => {
    const { result } = renderHook(() => useProduitForm());
    let res: Awaited<ReturnType<typeof result.current.submit>> = { ok: false };

    await act(async () => { res = await result.current.submit(); });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.produit?.id).toBe('p1');
    }
  });

  it('submit définit globalError si le service retourne { ok: false }', async () => {
    mockCreate.mockResolvedValue({ ok: false, error: 'Le nom est requis.' });
    const { result } = renderHook(() => useProduitForm());

    await act(async () => { await result.current.submit(); });

    expect(result.current.globalError).toBe('Le nom est requis.');
  });
});
