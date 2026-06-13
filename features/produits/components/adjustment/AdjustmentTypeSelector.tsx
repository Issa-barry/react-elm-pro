import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { AjustementDirection } from '../../hooks/useAjusterStock';

interface Props {
  value: AjustementDirection;
  onChange: (dir: AjustementDirection) => void;
}

export const AdjustmentTypeSelector = memo(function AdjustmentTypeSelector({ value, onChange }: Props) {
  const { colors } = useTheme();

  function toggle(dir: 'augmenter' | 'diminuer') {
    onChange(value === dir ? null : dir);
  }

  const augActive = value === 'augmenter';
  const dimActive = value === 'diminuer';

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
      <TouchableOpacity
        style={[
          styles.btn,
          augActive && { backgroundColor: colors.success + '20', borderColor: colors.success },
        ]}
        onPress={() => toggle('augmenter')}
        activeOpacity={0.75}
        accessibilityRole="radio"
        accessibilityState={{ checked: augActive }}
        accessibilityLabel="Augmenter le stock"
      >
        <Ionicons
          name="arrow-up-circle"
          size={20}
          color={augActive ? colors.success : colors.textMuted}
        />
        <Text style={[styles.btnText, { color: augActive ? colors.success : colors.textMuted }]}>
          Augmenter
        </Text>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <TouchableOpacity
        style={[
          styles.btn,
          dimActive && { backgroundColor: colors.danger + '20', borderColor: colors.danger },
        ]}
        onPress={() => toggle('diminuer')}
        activeOpacity={0.75}
        accessibilityRole="radio"
        accessibilityState={{ checked: dimActive }}
        accessibilityLabel="Diminuer le stock"
      >
        <Ionicons
          name="arrow-down-circle"
          size={20}
          color={dimActive ? colors.danger : colors.textMuted}
        />
        <Text style={[styles.btnText, { color: dimActive ? colors.danger : colors.textMuted }]}>
          Diminuer
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 14,
  },
  btnText: { fontSize: 15, fontWeight: '700' },
  divider: { width: StyleSheet.hairlineWidth, marginVertical: 10 },
});
