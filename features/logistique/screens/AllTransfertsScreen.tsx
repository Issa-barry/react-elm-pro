import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { StatutBadge } from '../components/StatutBadge';
import { useTransferts } from '../hooks/useTransferts';
import type { StatutTransfert, Transfert } from '../types/logistique.types';

const FILTRES: { value: StatutTransfert | ''; label: string }[] = [
  { value: '',           label: 'Tous' },
  { value: 'brouillon',  label: 'Brouillon' },
  { value: 'chargement', label: 'Chargement' },
  { value: 'transit',    label: 'Transit' },
  { value: 'reception',  label: 'Réceptionné' },
  { value: 'cloture',    label: 'Clôturé' },
  { value: 'annule',     label: 'Annulé' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function TransfertCard({ item, onPress }: { item: Transfert; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <Text style={[styles.ref, { color: colors.text }]}>{item.reference}</Text>
        <StatutBadge statut={item.statut} label={item.statut_label} />
      </View>
      <Text style={[styles.trajet, { color: colors.text }]}>
        {item.site_source.nom} → {item.site_destination.nom}
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {item.vehicule ? `${item.vehicule.nom_vehicule} · ` : ''}
        Départ : {formatDate(item.date_depart_prevue)}
      </Text>
    </TouchableOpacity>
  );
}

export default function AllTransfertsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [statut, setStatut] = useState<StatutTransfert | ''>('');

  const params = useMemo(
    () => (statut ? { statut } : undefined),
    [statut]
  );
  const { transferts, loading, refreshing, error, load, refetch } = useTransferts(params);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.primary }]}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Toutes les livraisons</Text>
        <View style={styles.spacer} />
      </View>

      <View style={[styles.filters, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          {FILTRES.map(f => {
            const active = statut === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.chip,
                  { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.infoBg : colors.background },
                ]}
                onPress={() => setStatut(f.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipLabel, { color: active ? colors.primary : colors.textMuted }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
          data={transferts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TransfertCard
              item={item}
              onPress={() => router.push(`/logistique/${item.id}` as never)}
            />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetch} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>🚚</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun transfert</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {statut ? 'Aucun transfert pour ce statut.' : 'Aucun transfert créé.'}
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

    filters:        { borderBottomWidth: StyleSheet.hairlineWidth },
    filtersContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    chip:           { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    chipLabel:      { fontSize: 13, fontWeight: '600' },

    list:    { padding: 16, gap: 12 },
    center:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
    card: {
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 14,
      gap: 6,
    },
    cardTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    ref:      { fontSize: 15, fontWeight: '700' },
    trajet:   { fontSize: 14, fontWeight: '500' },
    meta:     { fontSize: 12 },
    btn:      { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
    btnText:  { color: '#fff', fontWeight: '600' },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    emptyText: { fontSize: 14, textAlign: 'center' },
  });
}
