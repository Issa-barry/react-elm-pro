import { useCallback, useState } from 'react';
import { accueilService } from '../services/accueil.service';

interface QrPayloadState {
  qrPayload: string | null;
  loading: boolean;
}

export function useQrPayload() {
  const [state, setState] = useState<QrPayloadState>({ qrPayload: null, loading: true });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    const result = await accueilService.getQrPayload();
    setState({
      qrPayload: result.ok ? result.data : null,
      loading: false,
    });
  }, []);

  return { ...state, load };
}
