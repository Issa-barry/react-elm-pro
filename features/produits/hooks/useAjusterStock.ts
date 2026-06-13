import { useCallback, useMemo, useState } from 'react';
import { ajusterStock } from '../services/produits-api.service';
import {
  MOTIFS_AUGMENTATION,
  MOTIFS_DIMINUTION,
  type MotifAjustementStock,
  type Produit,
} from '../types/produit.types';

const VALEURS_AUGMENTATION = new Set(MOTIFS_AUGMENTATION.map(m => m.value));
const VALEURS_DIMINUTION   = new Set(MOTIFS_DIMINUTION.map(m => m.value));

export type AjustementDirection = 'augmenter' | 'diminuer' | null;

export function useAjusterStock(produit: Produit) {
  const [direction, setDirectionRaw] = useState<AjustementDirection>(null);
  const [quantite, setQuantiteRaw]   = useState('');
  const [motifType, setMotifTypeRaw] = useState<MotifAjustementStock | ''>('');
  const [loading, setLoading]        = useState(false);
  const [error, setError]            = useState<string | null>(null);
  const [motifError, setMotifError]  = useState(false);
  const [quantiteError, setQuantiteError] = useState(false);

  const setDirection = useCallback((dir: AjustementDirection) => {
    setDirectionRaw(dir);
    setQuantiteRaw('');
    setQuantiteError(false);
    setMotifTypeRaw(prev => {
      if (!prev) return prev;
      if (dir === 'augmenter' && !VALEURS_AUGMENTATION.has(prev)) return '';
      if (dir === 'diminuer'  && !VALEURS_DIMINUTION.has(prev))   return '';
      return prev;
    });
    setMotifError(false);
  }, []);

  const setQuantite = useCallback((val: string) => {
    setQuantiteRaw(val);
    if (val) setQuantiteError(false);
  }, []);

  const setMotifType = useCallback((val: MotifAjustementStock | '') => {
    setMotifTypeRaw(val);
    if (val) setMotifError(false);
  }, []);

  const stockActuel = produit.qte_stock ?? 0;

  const stockPreview = useMemo<number | null>(() => {
    const qty = Number(quantite);
    if (!direction || !qty || qty <= 0) return null;
    return direction === 'augmenter'
      ? stockActuel + qty
      : stockActuel - qty;
  }, [direction, quantite, stockActuel]);

  const submit = useCallback(async (): Promise<boolean> => {
    let valid = true;
    const qty = Number(quantite);

    if (!quantite || qty <= 0) {
      setQuantiteError(true);
      valid = false;
    }

    if (!motifType) {
      setMotifError(true);
      valid = false;
    }

    if (!valid) return false;

    setLoading(true);
    setError(null);
    try {
      const payload: Parameters<typeof ajusterStock>[1] = {
        motif_type: motifType as MotifAjustementStock,
      };
      if (direction === 'augmenter') payload.augmenter = qty;
      else payload.diminuer = qty;

      const result = await ajusterStock(produit.id, payload);
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  }, [produit.id, direction, quantite, motifType]);

  return {
    direction, setDirection,
    quantite, setQuantite,
    motifType, setMotifType,
    stockPreview,
    submit, loading, error,
    motifError, quantiteError,
  };
}
