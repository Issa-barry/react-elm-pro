import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import AjusterStockModal from '../components/AjusterStockModal';
import { useProduitDetail } from '../hooks/useProduitDetail';
import { deleteProduit } from '../services/produits-api.service';

function formatPrix(val: number | null): string {
  if (val == null) return '—';
  return new Intl.NumberFormat('fr-FR').format(val) + ' GNF';
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={infoStyles.row}>
      <Text style={[infoStyles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontSize: 13, flex: 1 },
  value: { fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
});

export default function ProduitDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { produit, loading, error, reload } = useProduitDetail(id ?? '');
  const [showAjuster, setShowAjuster] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  function handleModifier() {
    router.push({ pathname: '/produits/[id]/modifier', params: { id } });
  }

  function handleSupprimer() {
    Alert.alert(
      'Supprimer le produit',
      `Êtes-vous sûr de vouloir supprimer "${produit?.nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            setDeleting(true);
            const result = await deleteProduit(id);
            setDeleting(false);
            if (result.ok) {
              router.back();
            } else {
              Alert.alert('Erreur', result.error);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error || !produit ? (
        <View style={styles.center}>
          <Text style={{ color: colors.danger }}>{error ?? 'Produit introuvable'}</Text>
          <TouchableOpacity onPress={reload} style={[styles.retryBtn, { borderColor: colors.border }]}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          {produit.image_url ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setImageZoomed(true)}
              accessibilityLabel="Agrandir la photo">
              <View style={[styles.imageWrapper, { backgroundColor: colors.surfaceAlt }]}>
                <Image source={{ uri: produit.image_url }} style={styles.image} resizeMode="contain" />
                <View style={styles.zoomHint}>
                  <Ionicons name="expand-outline" size={18} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
            </View>
          )}

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.titleRow}>
              <Text style={[styles.nom, { color: colors.text }]}>{produit.nom}</Text>
              {produit.is_critique && (
                <View style={[styles.badge, { backgroundColor: colors.warningBg }]}>
                  <Text style={[styles.badgeText, { color: colors.warning }]}>Critique</Text>
                </View>
              )}
            </View>

            {produit.description ? (
              <Text style={[styles.description, { color: colors.textMuted }]}>{produit.description}</Text>
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow label="Code fournisseur" value={produit.code_fournisseur ?? '—'} />
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <InfoRow label="Type" value={produit.type_label ?? produit.type ?? '—'} />
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <InfoRow label="Statut" value={produit.statut_label ?? produit.statut ?? '—'} />
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Prix</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow label="Prix de vente" value={formatPrix(produit.prix_vente)} />
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <InfoRow label="Prix d'achat" value={formatPrix(produit.prix_achat)} />
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <InfoRow label="Prix usine" value={formatPrix(produit.prix_usine)} />
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <InfoRow label="Coût" value={formatPrix(produit.cout)} />
          </View>

          {produit.type_has_stock && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Stock</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <InfoRow label="Quantité en stock" value={String(produit.qte_stock ?? 0)} />
              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
              <InfoRow label="Seuil d'alerte" value={String(produit.seuil_alerte_stock ?? '—')} />
              {produit.is_low_stock && (
                <View style={[styles.alertBanner, { backgroundColor: colors.warningBg }]}>
                  <Ionicons name="warning-outline" size={14} color={colors.warning} />
                  <Text style={[styles.alertText, { color: colors.warning }]}>Stock faible</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.actions}>
            {produit.type_has_stock && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }]}
                onPress={() => setShowAjuster(true)}
              >
                <Ionicons name="swap-vertical-outline" size={18} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Ajuster le stock</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={handleModifier}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.dangerBg }]}
              onPress={handleSupprimer}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color={colors.danger} size="small" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  <Text style={[styles.actionBtnText, { color: colors.danger }]}>Supprimer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {produit && showAjuster ? (
        <AjusterStockModal
          visible={showAjuster}
          produit={produit}
          onClose={() => setShowAjuster(false)}
          onSuccess={reload}
        />
      ) : null}

      <Modal
        visible={imageZoomed}
        transparent
        animationType="fade"
        onRequestClose={() => setImageZoomed(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setImageZoomed(false)}>
          <Pressable style={styles.modalImageWrapper} onPress={() => {}}>
            <Image
              source={{ uri: produit?.image_url ?? '' }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setImageZoomed(false)}
              accessibilityLabel="Fermer">
              <Ionicons name="close-circle" size={32} color="#fff" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  retryBtn:         { marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  imageWrapper:     { width: '100%', height: 260, alignItems: 'center', justifyContent: 'center' },
  image:            { width: '100%', height: 260 },
  imagePlaceholder: { width: '100%', height: 160, alignItems: 'center', justifyContent: 'center' },
  zoomHint: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 8,
    padding: 5,
  },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalImageWrapper: { width: '100%', height: '70%' },
  modalImage:        { width: '100%', height: '100%' },
  modalCloseBtn: {
    position: 'absolute', top: -16, right: 8,
  },
  card:             {
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  titleRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  nom:              { fontSize: 20, fontWeight: '800', flex: 1 },
  badge:            { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:        { fontSize: 11, fontWeight: '700' },
  description:      { fontSize: 13, lineHeight: 20, marginTop: 4 },
  sectionTitle:     { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  divider:          { height: StyleSheet.hairlineWidth },
  alertBanner:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, padding: 8, borderRadius: 8 },
  alertText:        { fontSize: 12, fontWeight: '600' },
  actions:          { margin: 16, gap: 10 },
  actionBtn:        {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText:    { color: '#fff', fontSize: 15, fontWeight: '700' },
});
