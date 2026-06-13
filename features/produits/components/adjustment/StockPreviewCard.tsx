import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { AjustementDirection } from '../../hooks/useAjusterStock';

interface Props {
  direction: AjustementDirection;
  stockActuel: number;
  stockApres: number | null;
}

function formatNum(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

export const StockPreviewCard = memo(function StockPreviewCard({ direction, stockActuel, stockApres }: Props) {
  const { colors } = useTheme();

  if (stockApres === null) return null;

  const negative   = stockApres < 0;
  const isAug      = direction === 'augmenter';
  const accentColor = negative ? colors.danger : isAug ? colors.success : colors.danger;
  const bgColor     = negative ? colors.dangerBg : isAug ? colors.successBg : colors.dangerBg;
  const iconName    = isAug ? 'trending-up' : 'trending-down';

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor: accentColor + '55' }]}>
      <Ionicons name={iconName} size={18} color={accentColor} />
      <Text style={[styles.label, { color: accentColor }]}>Stock après ajustement</Text>
      <View style={styles.right}>
        <Text style={[styles.before, { color: colors.textMuted }]}>{formatNum(stockActuel)}</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.textMuted} />
        <Text style={[styles.after, { color: accentColor }]}>{formatNum(stockApres)}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label:  { flex: 1, fontSize: 13, fontWeight: '600' },
  right:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  before: { fontSize: 14, fontWeight: '600' },
  after:  { fontSize: 18, fontWeight: '800' },
});
