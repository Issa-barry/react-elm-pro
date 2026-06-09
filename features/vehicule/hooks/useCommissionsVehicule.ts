import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { commissionService } from '../services/commission.service';
import type { CommissionVehicule } from '../types/commission.types';

interface State {
  commissions: CommissionVehicule[];
  loading: boolean;
  error: string | null;
}

export function useCommissionsVehicule(vehiculeId: string) {
  const [state, setState] = useState<State>({ commissions: [], loading: true, error: null });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await commissionService.getCommissionsVehicule(vehiculeId);
    if (result.ok) {
      setState({ commissions: result.data, loading: false, error: null });
    } else {
      setState({ commissions: [], loading: false, error: result.error });
    }
  }, [vehiculeId]);

  // Se déclenche à chaque retour sur cet écran (navigation Stack)
  useFocusEffect(
    useCallback(() => { load(); }, [load])
  );

  return { ...state, refetch: load };
}
