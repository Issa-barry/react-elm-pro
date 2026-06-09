import { useCallback, useState } from 'react';
import { gainsService } from '../services/gains.service';
import type { GainsMine } from '../types/gains.types';

interface GainsMineState {
  gains: GainsMine | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

const INITIAL: GainsMineState = { gains: null, loading: true, refreshing: false, error: null };

export function useGainsMine() {
  const [state, setState] = useState<GainsMineState>(INITIAL);

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await gainsService.getMesGains();
    if (result.ok) {
      setState({ gains: result.data, loading: false, refreshing: false, error: null });
    } else {
      setState(prev => ({ ...prev, loading: false, refreshing: false, error: result.error }));
    }
  }, []);

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true, error: null }));
    const result = await gainsService.getMesGains();
    if (result.ok) {
      setState({ gains: result.data, loading: false, refreshing: false, error: null });
    } else {
      setState(prev => ({ ...prev, refreshing: false, error: result.error }));
    }
  }, []);

  return { ...state, load, refetch };
}
