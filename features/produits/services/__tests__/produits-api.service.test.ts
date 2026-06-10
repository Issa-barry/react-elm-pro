jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue('test-token') },
}));

import {
  ajusterStock,
  createProduit,
  deleteProduit,
  fetchProduit,
  fetchProduits,
  updateProduit,
} from '../produits-api.service';
import type { ProduitFormData } from '../../types/produit.types';

const PRODUIT = {
  id: 'p1',
  nom: 'Eau 1.5L',
  code_interne: 'EAU-001',
  code_fournisseur: null,
  type: 'achat_vente' as const,
  type_label: 'Achat/Vente',
  type_has_stock: true,
  statut: 'actif' as const,
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

const FORM: ProduitFormData = {
  nom: 'Eau 1.5L',
  code_fournisseur: '',
  type: 'achat_vente',
  statut: 'actif',
  prix_vente: '5000',
  prix_achat: '3000',
  prix_usine: '',
  cout: '',
  qte_stock: '100',
  seuil_alerte_stock: '10',
  description: '',
  is_critique: false,
  image: null,
};

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('fetchProduits', () => {
  it('retourne un tableau de produits (format bare)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [PRODUIT],
    });
    const result = await fetchProduits();
    expect(result).toEqual([PRODUIT]);
  });

  it('retourne un tableau de produits (format { data: [] })', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [PRODUIT] }),
    });
    const result = await fetchProduits();
    expect(result).toEqual([PRODUIT]);
  });

  it('lève une erreur si la réponse est ko', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({}) });
    await expect(fetchProduits()).rejects.toThrow('Erreur chargement produits');
  });

  it('appelle le bon chemin API avec le header Authorization', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    await fetchProduits();
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/api/v1/backoffice/produits');
    expect(options.headers.Authorization).toBe('Bearer test-token');
  });
});

describe('fetchProduit', () => {
  it('retourne le produit (format { data: {} })', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: PRODUIT }),
    });
    const result = await fetchProduit('p1');
    expect(result.id).toBe('p1');
  });

  it('lève une erreur si la réponse est ko', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({}) });
    await expect(fetchProduit('p1')).rejects.toThrow('Erreur chargement produit');
  });
});

describe('createProduit', () => {
  it('retourne { ok: true, data } si création réussie (201)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ data: PRODUIT }),
    });
    const result = await createProduit(FORM);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe('p1');
    }
  });

  it('retourne { ok: false } si réponse 422 avec erreurs de validation', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        errors: { nom: ['Le nom est requis.'], type: ['Le type est invalide.'] },
      }),
    });
    const result = await createProduit(FORM);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Le nom est requis.');
    }
  });

  it('retourne { ok: false } si erreur réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    const result = await createProduit(FORM);
    expect(result.ok).toBe(false);
  });
});

describe('updateProduit', () => {
  it('retourne { ok: true, data } si modification réussie', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: PRODUIT }),
    });
    const result = await updateProduit('p1', FORM);
    expect(result.ok).toBe(true);
  });

  it('envoie en PUT sur le bon chemin', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: PRODUIT }),
    });
    await updateProduit('p1', FORM);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/api/v1/backoffice/produits/p1');
    expect(options.method).toBe('PUT');
  });
});

describe('deleteProduit', () => {
  it('retourne { ok: true } si suppression réussie (204)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    const result = await deleteProduit('p1');
    expect(result.ok).toBe(true);
  });

  it('retourne { ok: false } si erreur serveur', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Produit introuvable' }),
    });
    const result = await deleteProduit('p1');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Produit introuvable');
    }
  });
});

describe('ajusterStock', () => {
  it('retourne { ok: true } si ajustement réussi', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { ...PRODUIT, qte_stock: 110 } }),
    });
    const result = await ajusterStock('p1', { augmenter: 10, motif: 'Réapprovisionnement' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.qte_stock).toBe(110);
    }
  });

  it('retourne { ok: false } si erreur 422', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        errors: { augmenter: ['La quantité doit être positive.'] },
      }),
    });
    const result = await ajusterStock('p1', { augmenter: -5 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('La quantité doit être positive.');
    }
  });

  it('appelle le bon chemin API', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: PRODUIT }),
    });
    await ajusterStock('p1', { augmenter: 5 });
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/api/v1/backoffice/produits/p1/ajuster-stock');
    expect(options.method).toBe('POST');
  });
});
