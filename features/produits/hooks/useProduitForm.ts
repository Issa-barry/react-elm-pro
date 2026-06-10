import { useCallback, useEffect, useState } from 'react';
import { createProduit, updateProduit } from '../services/produits-api.service';
import type { Produit, ProduitFormData } from '../types/produit.types';

const DEFAULT_FORM: ProduitFormData = {
  nom: '',
  code_fournisseur: '',
  type: '',
  statut: '',
  prix_vente: '',
  prix_achat: '',
  prix_usine: '',
  cout: '',
  qte_stock: '',
  seuil_alerte_stock: '',
  description: '',
  is_critique: false,
  image: null,
};

function produitToForm(produit: Produit): ProduitFormData {
  return {
    nom: produit.nom ?? '',
    code_fournisseur: produit.code_fournisseur ?? '',
    type: produit.type ?? '',
    statut: produit.statut ?? '',
    prix_vente: produit.prix_vente != null ? String(produit.prix_vente) : '',
    prix_achat: produit.prix_achat != null ? String(produit.prix_achat) : '',
    prix_usine: produit.prix_usine != null ? String(produit.prix_usine) : '',
    cout: produit.cout != null ? String(produit.cout) : '',
    qte_stock: produit.qte_stock != null ? String(produit.qte_stock) : '',
    seuil_alerte_stock:
      produit.seuil_alerte_stock != null ? String(produit.seuil_alerte_stock) : '',
    description: produit.description ?? '',
    is_critique: produit.is_critique,
    image: null,
  };
}

export function useProduitForm(produitExistant?: Produit | null) {
  const [form, setForm] = useState<ProduitFormData>(
    produitExistant ? produitToForm(produitExistant) : DEFAULT_FORM
  );
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (produitExistant) setForm(produitToForm(produitExistant));
  }, [produitExistant?.id]);

  const setField = useCallback(
    <K extends keyof ProduitFormData>(key: K, value: ProduitFormData[K]) => {
      setForm(prev => ({ ...prev, [key]: value }));
      setErrors(prev => {
        if (!prev[key as string]) return prev;
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    },
    []
  );

  const submit = useCallback(async (): Promise<{ ok: boolean; produit?: Produit }> => {
    setLoading(true);
    setErrors({});
    setGlobalError('');
    try {
      const result = produitExistant
        ? await updateProduit(produitExistant.id, form)
        : await createProduit(form);

      if (!result.ok) {
        setGlobalError(result.error);
        return { ok: false };
      }
      return { ok: true, produit: result.data };
    } finally {
      setLoading(false);
    }
  }, [form, produitExistant]);

  return { form, setField, submit, loading, errors, globalError };
}
