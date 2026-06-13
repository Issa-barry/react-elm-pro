import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { memo } from 'react';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { Produit } from '../../types/produit.types';

interface Props {
  produit: Produit;
}

function formatNum(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

export const StockAdjustmentHeader = memo(function StockAdjustmentHeader({ produit }: Props) {
  const { colors } = useTheme();
  const stock = produit.qte_stock ?? 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.left}>
        {produit.image_url ? (
          <Image source={{ uri: produit.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.iconBox, { backgroundColor: colors.primary + '18' }]}>
            <Ionicons name="cube-outline" size={24} color={colors.primary} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.nom, { color: colors.text }]} numberOfLines={2}>
            {produit.nom}
          </Text>
          {produit.code_interne ? (
            <Text style={[styles.code, { color: colors.textMuted }]}>{produit.code_interne}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.stockBox}>
        <Text style={[styles.stockLabel, { color: colors.textMuted }]}>Stock actuel</Text>
        <Text style={[styles.stockValue, { color: colors.text }]}>{formatNum(stock)}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  left:     { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  image:    { width: 46, height: 46, borderRadius: 10 },
  iconBox:  { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info:     { flex: 1 },
  nom:      { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  code:     { fontSize: 12, marginTop: 2, fontFamily: 'monospace' },
  stockBox: { alignItems: 'flex-end', minWidth: 70 },
  stockLabel: { fontSize: 11, fontWeight: '500' },
  stockValue: { fontSize: 28, fontWeight: '800', lineHeight: 32 },
});
