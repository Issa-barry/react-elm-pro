import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/shared/contexts/ThemeContext';
import type { Produit } from '../types/produit.types';

function formatPrix(val: number | null): string {
  if (val == null) return '—';
  return new Intl.NumberFormat('fr-FR').format(val) + ' GNF';
}

function statutColor(
  statut: Produit['statut'],
  colors: ReturnType<typeof useTheme>['colors']
): { bg: string; text: string } {
  switch (statut) {
    case 'actif':
      return { bg: colors.successBg, text: colors.success };
    case 'inactif':
      return { bg: colors.warningBg, text: colors.warning };
    case 'archive':
      return { bg: colors.dangerBg, text: colors.danger };
    default:
      return { bg: colors.surfaceAlt, text: colors.textMuted };
  }
}

interface ProduitCardProps {
  produit: Produit;
  onPress: () => void;
  onAjusterStock?: () => void;
}

export default function ProduitCard({ produit, onPress, onAjusterStock }: ProduitCardProps) {
  const { colors } = useTheme();
  const badge = statutColor(produit.statut, colors);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.nom, { color: colors.text }]} numberOfLines={1}>
              {produit.nom}
            </Text>
            {produit.is_critique && (
              <Ionicons name="warning" size={14} color={colors.warning} style={styles.critiqueIcon} />
            )}
          </View>

          <View style={styles.metaRow}>
            {produit.type_label ? (
              <View style={[styles.badge, { backgroundColor: colors.infoBg }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{produit.type_label}</Text>
              </View>
            ) : null}
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {produit.statut_label ?? produit.statut ?? '—'}
              </Text>
            </View>
          </View>

          <Text style={[styles.prix, { color: colors.text }]}>
            {formatPrix(produit.prix_vente)}
          </Text>

          {produit.type_has_stock && (
            <View style={styles.stockRow}>
              <Ionicons
                name="cube-outline"
                size={13}
                color={produit.is_low_stock ? colors.warning : colors.textMuted}
              />
              <Text
                style={[
                  styles.stock,
                  { color: produit.is_low_stock ? colors.warning : colors.textMuted },
                ]}
              >
                {produit.qte_stock ?? 0} en stock
                {produit.is_low_stock ? ' — stock faible' : ''}
              </Text>
            </View>
          )}
        </View>

        {produit.type_has_stock && onAjusterStock ? (
          <TouchableOpacity
            style={[styles.ajusterBtn, { backgroundColor: colors.primaryLight }]}
            onPress={onAjusterStock}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="swap-vertical" size={18} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  nom: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  critiqueIcon: {
    marginLeft: 4,
  },
  code: {
    fontSize: 12,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  prix: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stock: {
    fontSize: 12,
  },
  ajusterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    alignSelf: 'center',
  },
});
