import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { useCommissions } from '../hooks/useCommissions';
import type { Commission } from '../types/logistique.types';

function formatNum(val: number | null | undefined): string {
  if (val == null) return '—';
  return new Intl.NumberFormat('fr-FR').format(val);
}

function statutColor(statut: string, colors: ReturnType<typeof useTheme>['colors']) {
  if (statut === 'paye') return { bg: colors.successBg, text: colors.success };
  if (statut === 'partiel') return { bg: colors.warningBg, text: colors.warning };
  return { bg: colors.dangerBg, text: colors.danger };
}

function CommissionCard({ item }: { item: Commission }) {
  const { colors } = useTheme();
  const c = statutColor(item.statut, colors);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <View>
          <Text style={[styles.montant, { color: colors.text }]}>
            {formatNum(item.montant_total)} GNF
          </Text>
          <Text style={[styles.base, { color: colors.textMuted }]}>
            {item.base_calcul === 'par_pack'
              ? `${formatNum(item.valeur_base)} GNF × ${formatNum(item.quantite_reference)} packs`
              : item.base_calcul === 'forfait'
              ? 'Forfait'
              : `${formatNum(item.valeur_base)} GNF × ${formatNum(item.quantite_reference)} km`}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: c.bg }]}>
          <Text style={[styles.badgeText, { color: c.text }]}>{item.statut_label}</Text>
        </View>
      </View>

      <View style={styles.progress}>
        <Text style={[styles.progressText, { color: colors.textMuted }]}>
          Versé : {formatNum(item.montant_verse)} GNF
        </Text>
        <Text style={[styles.progressText, { color: colors.textMuted }]}>
          Restant : {formatNum(item.montant_restant)} GNF
        </Text>
      </View>

      {item.parts.length > 0 && (
        <View style={[styles.parts, { borderTopColor: colors.border }]}>
          {item.parts.map(part => (
            <View key={part.id} style={styles.partRow}>
              <Text style={[styles.partNom, { color: colors.text }]} numberOfLines={1}>
                {part.beneficiaire_nom}
              </Text>
              <Text style={[styles.partMontant, { color: colors.primary }]}>
                {formatNum(part.montant_net)} GNF
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function CommissionsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { commissions, loading, refreshing, error, load, refetch } = useCommissions();

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.primary }]}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Commissions</Text>
        <View style={styles.spacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.danger }}>{error}</Text>
          <TouchableOpacity onPress={refetch} style={[styles.btn, { backgroundColor: colors.primary }]}>
            <Text style={styles.btnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={commissions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <CommissionCard item={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetch} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune commission</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Les commissions apparaîtront après validation admin.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    root:    { flex: 1, backgroundColor: colors.background },
    header:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
    backBtn: {},
    backLabel: { fontSize: 17 },
    title:   { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
    spacer:  { minWidth: 60 },
    list:    { padding: 16, gap: 12 },
    center:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },

    card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10 },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
    montant: { fontSize: 18, fontWeight: '800' },
    base:    { fontSize: 12, marginTop: 2 },
    badge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: '600' },

    progress:     { flexDirection: 'row', justifyContent: 'space-between' },
    progressText: { fontSize: 12 },

    parts:   { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, gap: 6 },
    partRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    partNom: { fontSize: 13, flex: 1 },
    partMontant: { fontSize: 13, fontWeight: '700' },

    btn:     { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
    btnText: { color: '#fff', fontWeight: '600' },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    emptyText: { fontSize: 14, textAlign: 'center' },
  });
}
