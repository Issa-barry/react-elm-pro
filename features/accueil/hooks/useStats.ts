import { useCallback, useState } from 'react';
import { statsService, type AccueilStats } from '../services/stats.service';

interface StatsState {
  stats:   AccueilStats | null;
  loading: boolean;
}

const EMPTY: AccueilStats = {
  total_factures: 0, nb_total: 0,
  factures_payees: 0, nb_payees: 0,
  reste_encaisser: 0, nb_impayees: 0, nb_annulees: 0,
};

export function useStats() {
  const [state, setState] = useState<StatsState>({ stats: null, loading: true });

  const load = useCallback(async () => {
    const cached = await statsService.getCached();
    if (cached) setState({ stats: cached, loading: false });

    const result = await statsService.getStats();
    if (result.ok) {
      setState({ stats: result.data, loading: false });
    } else if (!cached) {
      setState({ stats: EMPTY, loading: false });
    }
  }, []);

  return { ...state, load };
}
