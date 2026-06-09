import { useCallback, useState } from 'react';
import { livraisonService } from '../services/livraison.service';
import type { LivraisonEnCours } from '../types/livraison.types';

interface State {
  livraisons: LivraisonEnCours[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export function useLivraisonsEnCours() {
  const [state, setState] = useState<State>({ livraisons: [], loading: true, refreshing: false, error: null });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await livraisonService.getLivraisonsEnCours();
    if (result.ok) {
      setState({ livraisons: result.data, loading: false, refreshing: false, error: null });
    } else {
      setState(prev => ({ ...prev, loading: false, refreshing: false, error: result.error }));
    }
  }, []);

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true, error: null }));
    const result = await livraisonService.getLivraisonsEnCours();
    if (result.ok) {
      setState({ livraisons: result.data, loading: false, refreshing: false, error: null });
    } else {
      setState(prev => ({ ...prev, refreshing: false, error: result.error }));
    }
  }, []);

  return { ...state, load, refetch };
}
