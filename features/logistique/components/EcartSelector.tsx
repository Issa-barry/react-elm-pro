import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { TypeEcart } from '../types/logistique.types';

const OPTIONS: { value: TypeEcart; label: string }[] = [
  { value: 'conforme',  label: 'Conforme' },
  { value: 'casse',     label: 'Cassé' },
  { value: 'perte',     label: 'Perte' },
  { value: 'surplus',   label: 'Surplus' },
  { value: 'manquant',  label: 'Manquant' },
];

interface Props {
  value: TypeEcart | null;
  onChange: (v: TypeEcart) => void;
  disabled?: boolean;
}

export function EcartSelector({ value, onChange, disabled = false }: Props) {
  const { colors } = useTheme();

  const colorFor = (ecart: TypeEcart) => {
    if (ecart === 'conforme') return { active: colors.success,  bg: colors.successBg };
    if (ecart === 'surplus' || ecart === 'manquant') return { active: colors.warning, bg: colors.warningBg };
    return { active: colors.danger, bg: colors.dangerBg };
  };

  return (
    <View style={styles.row}>
      {OPTIONS.map(opt => {
        const selected = value === opt.value;
        const c = colorFor(opt.value);
        return (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.chip,
              { borderColor: selected ? c.active : colors.border, backgroundColor: selected ? c.bg : colors.background },
            ]}
            onPress={() => !disabled && onChange(opt.value)}
            activeOpacity={disabled ? 1 : 0.7}
          >
            <Text style={[styles.chipLabel, { color: selected ? c.active : colors.textMuted }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:     { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipLabel: { fontSize: 12, fontWeight: '600' },
});
