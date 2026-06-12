import { useCallback, useState } from 'react';
import { fetchTransfert } from '../services/logistique-api.service';
import type { Transfert } from '../types/logistique.types';

export function useTransfertDetail(id: string) {
  const [transfert, setTransfert] = useState<Transfert | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchTransfert(id);
    if (result.ok) {
      setTransfert(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [id]);

  return { transfert, loading, error, load, reload: load };
}
