import { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/shared/contexts/ThemeContext';
import {
  MOTIFS_AUGMENTATION,
  MOTIFS_DIMINUTION,
  type MotifAjustementStock,
} from '../../types/produit.types';
import type { AjustementDirection } from '../../hooks/useAjusterStock';

interface Props {
  direction: AjustementDirection;
  value: MotifAjustementStock | '';
  onChange: (v: MotifAjustementStock) => void;
  error: boolean;
}

export const AdjustmentReasonSelector = memo(function AdjustmentReasonSelector({
  direction,
  value,
  onChange,
  error,
}: Props) {
  const { colors } = useTheme();

  const options = useMemo(() => {
    if (direction === 'augmenter') return MOTIFS_AUGMENTATION;
    if (direction === 'diminuer')  return MOTIFS_DIMINUTION;
    return [];
  }, [direction]);

  const accentColor = direction === 'augmenter' ? colors.success : colors.danger;
  const accentBg    = direction === 'augmenter' ? colors.successBg : colors.dangerBg;

  if (!direction) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.placeholder, { color: colors.textMuted }]}>
          Sélectionnez d'abord une direction…
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>
        Motif <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <View style={styles.chips}>
        {options.map(opt => {
          const active = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                { borderColor: active ? accentColor : colors.border, backgroundColor: active ? accentBg : colors.surfaceAlt },
              ]}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
            >
              <Text style={[styles.chipText, { color: active ? accentColor : colors.text, fontWeight: active ? '700' : '500' }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: colors.danger }]}>Le motif est obligatoire</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  label:       { fontSize: 14, fontWeight: '700' },
  placeholder: { fontSize: 14, textAlign: 'center', paddingVertical: 8 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 100,
    borderWidth: 1.5,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipText:  { fontSize: 14 },
  errorText: { fontSize: 12 },
});
