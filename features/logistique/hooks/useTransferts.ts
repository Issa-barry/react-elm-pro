import { useCallback, useState } from 'react';
import { fetchTransferts } from '../services/logistique-api.service';
import type { Transfert } from '../types/logistique.types';

export function useTransferts(params?: { statut?: string; search?: string }) {
  const [transferts, setTransferts] = useState<Transfert[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchTransferts(params);
    if (result.ok) {
      setTransferts(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [params?.statut, params?.search]);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    const result = await fetchTransferts(params);
    if (result.ok) {
      setTransferts(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setRefreshing(false);
  }, [params?.statut, params?.search]);

  return { transferts, loading, refreshing, error, load, refetch };
}
