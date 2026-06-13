import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/shared/contexts/ThemeContext';
import type { AjustementDirection } from '../../hooks/useAjusterStock';

interface Props {
  direction: AjustementDirection;
  value: string;
  error: boolean;
}

function formatDisplay(raw: string): string {
  const n = parseInt(raw, 10);
  return isNaN(n) ? '0' : new Intl.NumberFormat('fr-FR').format(n);
}

export const AdjustmentQuantityInput = memo(function AdjustmentQuantityInput({
  direction,
  value,
  error,
}: Props) {
  const { colors } = useTheme();

  const accentColor =
    direction === 'augmenter'
      ? colors.success
      : direction === 'diminuer'
        ? colors.danger
        : colors.primary;

  const borderColor = error
    ? colors.danger
    : direction
      ? accentColor
      : colors.border;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor },
      ]}
    >
      {!direction ? (
        <Text style={[styles.placeholder, { color: colors.textMuted }]}>
          Sélectionnez d'abord une direction…
        </Text>
      ) : (
        <Text
          style={[styles.value, { color: accentColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          accessibilityLabel={`Quantité : ${value || '0'}`}
        >
          {formatDisplay(value)}
        </Text>
      )}
      {error && (
        <Text style={[styles.errorText, { color: colors.danger }]}>
          La quantité est obligatoire
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 4,
    minHeight: 90,
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  value: {
    fontSize: 52,
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
  },
  errorText: { fontSize: 12, textAlign: 'center' },
});
