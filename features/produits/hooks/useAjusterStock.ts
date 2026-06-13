import { useCallback, useState } from 'react';
import { ajusterStock } from '../services/produits-api.service';
import {
  MOTIFS_AUGMENTATION,
  MOTIFS_DIMINUTION,
  type MotifAjustementStock,
  type Produit,
} from '../types/produit.types';

const VALEURS_AUGMENTATION = new Set(MOTIFS_AUGMENTATION.map(m => m.value));
const VALEURS_DIMINUTION   = new Set(MOTIFS_DIMINUTION.map(m => m.value));

export function useAjusterStock(produit: Produit) {
  const [augmenter, setAugmenterRaw] = useState('');
  const [diminuer, setDiminuerRaw]   = useState('');
  const [motifType, setMotifTypeRaw] = useState<MotifAjustementStock | ''>('');
  const [motifDetail, setMotifDetail] = useState('');
  const [loading, setLoading]        = useState(false);
  const [error, setError]            = useState<string | null>(null);
  const [motifError, setMotifError]  = useState(false);
  const [motifDetailError, setMotifDetailError] = useState(false);

  const setAugmenter = useCallback((val: string) => {
    setAugmenterRaw(val);
    if (val) {
      setDiminuerRaw('');
      // Réinitialise le motif s'il n'est pas valide pour une augmentation
      setMotifTypeRaw(prev =>
        prev && !VALEURS_AUGMENTATION.has(prev) ? '' : prev
      );
    }
  }, []);

  const setDiminuer = useCallback((val: string) => {
    setDiminuerRaw(val);
    if (val) {
      setAugmenterRaw('');
      // Réinitialise le motif s'il n'est pas valide pour une diminution
      setMotifTypeRaw(prev =>
        prev && !VALEURS_DIMINUTION.has(prev) ? '' : prev
      );
    }
  }, []);

  const setMotifType = useCallback((val: MotifAjustementStock | '') => {
    setMotifTypeRaw(val);
    if (val) setMotifError(false);
    if (val !== 'autre') {
      setMotifDetail('');
      setMotifDetailError(false);
    }
  }, []);

  const handleSetMotifDetail = useCallback((val: string) => {
    setMotifDetail(val);
    if (val.trim()) setMotifDetailError(false);
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    let valid = true;

    if (!motifType) {
      setMotifError(true);
      valid = false;
    } else {
      setMotifError(false);
    }

    if (motifType === 'autre' && !motifDetail.trim()) {
      setMotifDetailError(true);
      valid = false;
    } else {
      setMotifDetailError(false);
    }

    if (!valid) return false;

    setLoading(true);
    setError(null);
    try {
      const payload: Parameters<typeof ajusterStock>[1] = {
        motif_type: motifType as MotifAjustementStock,
      };
      if (augmenter) payload.augmenter = Number(augmenter);
      if (diminuer) payload.diminuer = Number(diminuer);
      if (motifType === 'autre') payload.motif_detail = motifDetail.trim();

      const result = await ajusterStock(produit.id, payload);
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      return true;
    } finally {
      setLoading(false);
    }
  }, [produit.id, augmenter, diminuer, motifType, motifDetail]);

  // Direction courante déduite des champs saisis
  const direction: 'augmenter' | 'diminuer' | '' = augmenter
    ? 'augmenter'
    : diminuer
      ? 'diminuer'
      : '';

  return {
    augmenter, setAugmenter,
    diminuer, setDiminuer,
    motifType, setMotifType,
    motifDetail, setMotifDetail: handleSetMotifDetail,
    direction,
    submit, loading, error,
    motifError, motifDetailError,
  };
}
