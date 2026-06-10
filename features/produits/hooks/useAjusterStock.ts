import { useCallback, useState } from 'react';
import { ajusterStock } from '../services/produits-api.service';
import type { Produit } from '../types/produit.types';

export function useAjusterStock(produit: Produit) {
  const [augmenter, setAugmenterRaw] = useState('');
  const [diminuer, setDiminuerRaw]   = useState('');
  const [motif, setMotif]            = useState('');
  const [loading, setLoading]        = useState(false);
  const [error, setError]            = useState<string | null>(null);

  const setAugmenter = useCallback((val: string) => {
    setAugmenterRaw(val);
    if (val) setDiminuerRaw('');
  }, []);

  const setDiminuer = useCallback((val: string) => {
    setDiminuerRaw(val);
    if (val) setAugmenterRaw('');
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const payload: { augmenter?: number; diminuer?: number; motif?: string } = {};
      if (augmenter) payload.augmenter = Number(augmenter);
      if (diminuer) payload.diminuer = Number(diminuer);
      if (motif.trim()) payload.motif = motif.trim();

      const result = await ajusterStock(produit.id, payload);
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  }, [produit.id, augmenter, diminuer, motif]);

  return { augmenter, setAugmenter, diminuer, setDiminuer, motif, setMotif, submit, loading, error };
}
