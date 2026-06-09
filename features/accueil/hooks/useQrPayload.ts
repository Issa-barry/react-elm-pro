import { useCallback, useState } from 'react';
import { accueilService, type AccueilData } from '../services/accueil.service';

interface AccueilState {
  qrPayload: string | null;
  site: AccueilData['site'];
  loading: boolean;
}

export function useQrPayload() {
  const [state, setState] = useState<AccueilState>({
    qrPayload: null,
    site:      null,
    loading:   true,
  });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    const result = await accueilService.getAccueilData();
    setState({
      qrPayload: result.ok ? result.data.qr_payload : null,
      site:      result.ok ? result.data.site : null,
      loading:   false,
    });
  }, []);

  return { ...state, load };
}
