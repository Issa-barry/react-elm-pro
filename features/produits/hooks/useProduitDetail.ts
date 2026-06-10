import { useCallback, useEffect, useState } from 'react';
import { fetchProduit } from '../services/produits-api.service';
import type { Produit } from '../types/produit.types';

export function useProduitDetail(id: string) {
  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProduit(id);
      setProduit(data);
    } catch {
      setError('Impossible de charger le produit.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { produit, loading, error, reload: load };
}
