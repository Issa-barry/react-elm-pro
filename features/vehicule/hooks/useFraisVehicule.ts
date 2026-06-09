import { useCallback, useState } from 'react';
import { fraisService } from '../services/frais.service';
import type { FraisApi } from '../types/frais.types';

interface State {
  frais: FraisApi[];
  loading: boolean;
  error: string | null;
}

export function useFraisVehicule(vehiculeId: string) {
  const [state, setState] = useState<State>({ frais: [], loading: true, error: null });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await fraisService.getFraisVehicule(vehiculeId);
    if (result.ok) {
      setState({ frais: result.data, loading: false, error: null });
    } else {
      setState({ frais: [], loading: false, error: result.error });
    }
  }, [vehiculeId]);

  return { ...state, load };
}
