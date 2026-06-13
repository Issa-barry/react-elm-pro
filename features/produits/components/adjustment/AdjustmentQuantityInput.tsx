import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { AjustementDirection } from '../../hooks/useAjusterStock';

interface Props {
  direction: AjustementDirection;
  value: string;
  onChange: (v: string) => void;
  error: boolean;
}

function formatDisplay(raw: string): string {
  const n = parseInt(raw, 10);
  return isNaN(n) ? '' : new Intl.NumberFormat('fr-FR').format(n);
}

export const AdjustmentQuantityInput = memo(function AdjustmentQuantityInput({
  direction,
  value,
  onChange,
  error,
}: Props) {
  const { colors } = useTheme();
  const ref = useRef<TextInput>(null);

  useEffect(() => {
    if (direction) {
      const timer = setTimeout(() => ref.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [direction]);

  const accentColor = direction === 'augmenter' ? colors.success : direction === 'diminuer' ? colors.danger : colors.primary;
  const borderColor = error ? colors.danger : direction ? accentColor : colors.border;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {!direction ? (
        <Text style={[styles.placeholder, { color: colors.textMuted }]}>
          Sélectionnez d'abord une direction…
        </Text>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            ref={ref}
            key={direction}
            style={[styles.input, { color: accentColor, borderColor }]}
            value={formatDisplay(value)}
            onChangeText={text => onChange(text.replace(/\D/g, ''))}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textLight}
            selectTextOnFocus
            accessibilityLabel="Quantité"
          />
          {value ? (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => { onChange(''); ref.current?.focus(); }}
              accessibilityLabel="Effacer la quantité"
            >
              <Ionicons name="close-circle" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}
      {error && (
        <Text style={[styles.errorText, { color: colors.danger }]}>La quantité est obligatoire</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 4,
  },
  placeholder: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 70,
  },
  clearBtn: {
    padding: 4,
  },
  errorText: { fontSize: 12, textAlign: 'center' },
});
