import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/contexts/ThemeContext';
import {
  MOTIFS_AUGMENTATION,
  MOTIFS_DIMINUTION,
  type MotifAjustementStock,
} from '../../types/produit.types';
import type { AjustementDirection } from '../../hooks/useAjusterStock';

interface Props {
  visible: boolean;
  direction: AjustementDirection;
  quantite: string;
  motifType: MotifAjustementStock | '';
  stockActuel: number;
  stockApres: number | null;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function formatNum(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

function getMotifLabel(motif: MotifAjustementStock | ''): string {
  if (!motif) return '';
  const found =
    MOTIFS_AUGMENTATION.find(m => m.value === motif) ??
    MOTIFS_DIMINUTION.find(m => m.value === motif);
  return found?.label ?? motif;
}

export const AdjustmentConfirmModal = memo(function AdjustmentConfirmModal({
  visible,
  direction,
  quantite,
  motifType,
  stockActuel,
  stockApres,
  loading,
  error,
  onConfirm,
  onCancel,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const isAug       = direction === 'augmenter';
  const accentColor = isAug ? colors.success : colors.danger;
  const dirLabel    = isAug ? '↑ Augmentation' : '↓ Diminution';
  const qty         = Number.parseInt(quantite, 10);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} />

      <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <Text style={[styles.title, { color: colors.text }]}>Confirmer l'ajustement</Text>

        <View style={[styles.summaryCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Row label="Direction" value={dirLabel} valueColor={accentColor} />
          <Separator color={colors.border} />
          <Row label="Quantité" value={formatNum(Number.isNaN(qty) ? 0 : qty)} valueColor={colors.text} />
          <Separator color={colors.border} />
          <Row label="Motif" value={getMotifLabel(motifType)} valueColor={colors.text} />
          <Separator color={colors.border} />
          <Row label="Stock actuel" value={formatNum(stockActuel)} valueColor={colors.textMuted} />
          {stockApres !== null && (
            <>
              <Separator color={colors.border} />
              <Row label="Stock après" value={formatNum(stockApres)} valueColor={accentColor} bold />
            </>
          )}
        </View>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.dangerBg }]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: colors.border }]}
            onPress={onCancel}
            disabled={loading}
            accessibilityLabel="Annuler"
          >
            <Text style={[styles.btnSecondaryText, { color: colors.text }]}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: accentColor }]}
            onPress={onConfirm}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityLabel="Confirmer l'ajustement"
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.btnPrimaryText}>Confirmer</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

function Row({ label, value, valueColor, bold }: Readonly<{ label: string; value: string; valueColor: string; bold?: boolean }>) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: valueColor, fontWeight: bold ? '800' : '600' }]}>
        {value}
      </Text>
    </View>
  );
}

function Separator({ color }: Readonly<{ color: string }>) {
  return <View style={[styles.sep, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowLabel:  { fontSize: 14 },
  rowValue:  { fontSize: 15 },
  sep:       { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  errorText: { fontSize: 13, flex: 1 },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: { fontSize: 16, fontWeight: '600' },
  btnPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
