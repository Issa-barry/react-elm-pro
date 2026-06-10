import { useCallback, useEffect, useState } from 'react';
import { fetchProduits } from '../services/produits-api.service';
import type { Produit } from '../types/produit.types';

export function useProduits() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProduits();
      setProduits(data);
    } catch {
      setError('Impossible de charger les produits.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { produits, loading, error, reload: load };
}
