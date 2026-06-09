import { useCallback, useState } from 'react';
import { vehiculeService } from '../services/vehicule.service';
import type { VehiculeApi } from '../types/vehicule.types';

interface VehiculesMineState {
  vehicules: VehiculeApi[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

const INITIAL: VehiculesMineState = {
  vehicules: [],
  loading: true,
  refreshing: false,
  error: null,
};

export function useVehiculesMine() {
  const [state, setState] = useState<VehiculesMineState>(INITIAL);

  // Chargement initial — affiche le spinner plein écran
  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await vehiculeService.getMesVehicules();
    if (result.ok) {
      setState({ vehicules: result.data, loading: false, refreshing: false, error: null });
    } else {
      setState(prev => ({ ...prev, loading: false, refreshing: false, error: result.error }));
    }
  }, []);

  // Rafraîchissement silencieux — garde la liste visible pendant le rechargement
  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true, error: null }));
    const result = await vehiculeService.getMesVehicules();
    if (result.ok) {
      setState({ vehicules: result.data, loading: false, refreshing: false, error: null });
    } else {
      setState(prev => ({ ...prev, refreshing: false, error: result.error }));
    }
  }, []);

  return { ...state, load, refetch };
}
