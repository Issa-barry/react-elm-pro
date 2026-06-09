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
    // 1. Affiche le cache immédiatement — pas de spinner si déjà chargé
    const cached = await accueilService.getCached();
    if (cached) {
      setState({ qrPayload: cached.qr_payload, site: cached.site, loading: false });
    }

    // 2. Rafraîchit depuis l'API en fond — silencieux si le cache existait
    const result = await accueilService.getAccueilData();
    if (result.ok) {
      setState({ qrPayload: result.data.qr_payload, site: result.data.site, loading: false });
    } else if (!cached) {
      // Aucun cache ET l'API échoue : on arrête le spinner
      setState(prev => ({ ...prev, loading: false }));
    }
    // Si l'API échoue mais qu'un cache existe, les valeurs en cache restent affichées
  }, []);

  return { ...state, load };
}
