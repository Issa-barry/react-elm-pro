import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/shared/contexts/ThemeContext';
import type { Produit } from '../types/produit.types';

function formatPrix(val: number | null): string {
  if (val == null) return '—';
  return new Intl.NumberFormat('fr-FR').format(val) + ' GNF';
}

function formatQte(val: number | null | undefined): string {
  if (val == null) return '—';
  return new Intl.NumberFormat('fr-FR').format(val);
}

function statutColor(
  statut: Produit['statut'],
  colors: ReturnType<typeof useTheme>['colors']
): { bg: string; text: string } {
  switch (statut) {
    case 'actif':   return { bg: colors.successBg, text: colors.success };
    case 'inactif': return { bg: colors.warningBg, text: colors.warning };
    case 'archive': return { bg: colors.dangerBg,  text: colors.danger };
    default:        return { bg: colors.surfaceAlt, text: colors.textMuted };
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
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {/* Photo / icône */}
        <TouchableOpacity
          style={[styles.imageBox, { backgroundColor: colors.surfaceAlt }]}
          onPress={produit.image_url ? () => setZoomed(true) : onPress}
          activeOpacity={0.85}
        >
          {produit.image_url ? (
            <>
              <Image
                source={{ uri: produit.image_url }}
                style={styles.image}
                contentFit="cover"
                transition={150}
              />
              <View style={styles.zoomHint}>
                <Ionicons name="expand-outline" size={12} color="#fff" />
              </View>
            </>
          ) : (
            <Ionicons name="cube-outline" size={32} color={colors.textMuted} />
          )}
        </TouchableOpacity>

        {/* Infos */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.nom, { color: colors.text }]} numberOfLines={2}>
              {produit.nom}
            </Text>
            {produit.is_alerte && (
              <Ionicons name="warning" size={15} color={colors.warning} style={styles.alertIcon} />
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
              <Text style={[styles.stock, { color: produit.is_low_stock ? colors.warning : colors.textMuted }]}>
                {formatQte(produit.qte_stock)} en stock{produit.is_low_stock ? ' — stock faible' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Bouton ajuster stock */}
        {produit.type_has_stock && onAjusterStock ? (
          <TouchableOpacity
            style={[styles.ajusterBtn, { backgroundColor: colors.primaryLight }]}
            onPress={onAjusterStock}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="swap-vertical" size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>

      {/* Zoom modal */}
      {produit.image_url ? (
        <Modal visible={zoomed} transparent animationType="fade" onRequestClose={() => setZoomed(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setZoomed(false)}>
            <View style={styles.modalImageWrapper}>
              <Image
                source={{ uri: produit.image_url }}
                style={styles.modalImage}
                contentFit="contain"
              />
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setZoomed(false)}
                accessibilityLabel="Fermer"
              >
                <Ionicons name="close-circle" size={34} color="#fff" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 7,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 14,
    minHeight: 100,
  },

  imageBox: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  image: { width: 72, height: 72 },
  zoomHint: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 6,
    padding: 3,
  },

  info: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nom: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    lineHeight: 20,
  },
  alertIcon: { marginLeft: 4, marginTop: 2 },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  prix: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stock: { fontSize: 12 },

  ajusterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Zoom modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageWrapper: {
    width: '90%',
    height: '60%',
  },
  modalImage: { width: '100%', height: '100%' },
  modalCloseBtn: {
    position: 'absolute',
    top: -18,
    right: -8,
  },
});
