import { Ionicons } from '@expo/vector-icons';
import { memo, useMemo, useState } from 'react';
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
  const [open, setOpen] = useState(false);

  const options = useMemo(() => {
    if (direction === 'augmenter') return MOTIFS_AUGMENTATION;
    if (direction === 'diminuer')  return MOTIFS_DIMINUTION;
    return [];
  }, [direction]);

  const selectedLabel = options.find(o => o.value === value)?.label ?? '';
  const disabled      = !direction;
  const borderColor   = error ? colors.danger : open ? colors.primary : colors.border;

  function handleSelect(v: MotifAjustementStock) {
    onChange(v);
    setOpen(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>
        Motif <Text style={{ color: colors.danger }}>*</Text>
      </Text>

      {/* Trigger */}
      <TouchableOpacity
        style={[
          styles.trigger,
          {
            backgroundColor: disabled ? colors.surfaceAlt : colors.surface,
            borderColor,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={() => { if (!disabled) setOpen(v => !v); }}
        activeOpacity={disabled ? 1 : 0.8}
        accessibilityRole="button"
        accessibilityLabel="Sélectionner un motif"
        accessibilityState={{ expanded: open }}
      >
        <Text style={[styles.triggerText, { color: value ? colors.text : colors.textMuted }]}>
          {disabled
            ? 'Sélectionnez d\'abord une direction…'
            : selectedLabel || 'Sélectionner un motif…'}
        </Text>
        {!disabled && (
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        )}
      </TouchableOpacity>

      {/* Liste déroulante */}
      {open && !disabled && (
        <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {options.map((opt, idx) => {
            const active = value === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.option,
                  active && { backgroundColor: colors.infoBg },
                  idx < options.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
                ]}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, { color: active ? colors.primary : colors.text }]}>
                  {opt.label}
                </Text>
                {active && <Ionicons name="checkmark" size={16} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

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
    gap: 10,
  },
  label: { fontSize: 14, fontWeight: '700' },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
  },
  triggerText: { fontSize: 14, fontWeight: '500', flex: 1 },
  list: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
  },
  optionText: { fontSize: 14, flex: 1 },
  errorText:  { fontSize: 12 },
});
