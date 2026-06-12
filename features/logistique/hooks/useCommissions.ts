import { useCallback, useState } from 'react';
import { fetchCommissions } from '../services/logistique-api.service';
import type { Commission } from '../types/logistique.types';

export function useCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchCommissions();
    if (result.ok) {
      setCommissions(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    const result = await fetchCommissions();
    if (result.ok) {
      setCommissions(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setRefreshing(false);
  }, []);

  return { commissions, loading, refreshing, error, load, refetch };
}
