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
import { StatutBadge } from '../components/StatutBadge';
import { useTransferts } from '../hooks/useTransferts';
import type { Transfert } from '../types/logistique.types';

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
      <View style={styles.trajet}>
        <Text style={[styles.trajetText, { color: colors.text }]}>
          {item.site_source.nom}
        </Text>
        <Text style={[styles.arrow, { color: colors.textMuted }]}> → </Text>
        <Text style={[styles.trajetText, { color: colors.text }]}>
          {item.site_destination.nom}
        </Text>
      </View>
      <View style={styles.meta}>
        {item.vehicule && (
          <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
            {item.vehicule.nom_vehicule} · {item.vehicule.immatriculation}
          </Text>
        )}
        <Text style={[styles.metaText, { color: colors.textMuted }]}>
          Arrivée prévue : {formatDate(item.date_arrivee_prevue)}
        </Text>
        {item.nb_packs_demandes != null && (
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {item.nb_packs_demandes} packs
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ReceptionsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { transferts, loading, refreshing, error, load, refetch } = useTransferts({ statut: 'transit' });

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.primary }]}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Réceptions en attente</Text>
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
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune réception en attente</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Tous les transferts ont été réceptionnés.
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
    card: {
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 14,
      gap: 8,
    },
    cardTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    ref:      { fontSize: 15, fontWeight: '700' },
    trajet:   { flexDirection: 'row', alignItems: 'center' },
    trajetText: { fontSize: 14, fontWeight: '600' },
    arrow:    { fontSize: 14 },
    meta:     { gap: 2 },
    metaText: { fontSize: 12 },
    btn:      { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
    btnText:  { color: '#fff', fontWeight: '600' },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    emptyText: { fontSize: 14, textAlign: 'center' },
  });
}
