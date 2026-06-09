import { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { formatMontant, formatDate } from '@/shared/utils/format';
import { useCommissionsVehicule } from '../hooks/useCommissionsVehicule';
import type { CommissionVehicule, StatutCommission } from '../types/commission.types';

interface Props {
  id: string;
  nom: string;
  immatriculation: string;
}

type Filtre = 'tous' | StatutCommission;

const FILTRES: { key: Filtre; label: string }[] = [
  { key: 'tous',        label: 'Tous' },
  { key: 'paye',        label: 'Payé' },
  { key: 'partiel',     label: 'Partiel' },
  { key: 'en_attente',  label: 'En attente' },
];

function getStatutConfig(colors: ReturnType<typeof useTheme>['colors']): Record<StatutCommission, { label: string; bg: string; text: string }> {
  return {
    paye:       { label: 'Payé',       bg: colors.successBg, text: colors.success },
    partiel:    { label: 'Partiel',    bg: colors.warningBg, text: colors.warning },
    en_attente: { label: 'En attente', bg: colors.warningBg, text: colors.warning },
  };
}

// ─── Composants ──────────────────────────────────────────────────────────────

function FiltreChips({ actif, onChange }: Readonly<{ actif: Filtre; onChange: (f: Filtre) => void }>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtreList}>
      {FILTRES.map((f) => {
        const isActive = f.key === actif;
        return (
          <TouchableOpacity key={f.key} onPress={() => onChange(f.key)} activeOpacity={0.7}
            style={[styles.chip, isActive && styles.chipActive]}>
            <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function CommissionRow({ tx, isLast }: Readonly<{ tx: CommissionVehicule; isLast: boolean }>) {
  const { colors } = useTheme();
  const styles  = useMemo(() => makeStyles(colors), [colors]);
  const statutConfig = getStatutConfig(colors);
  const statut  = statutConfig[tx.statut];

  return (
    <View>
      <View style={styles.txRow}>
        <View style={styles.txLeft}>
          <Text style={styles.txRef}>{tx.reference}</Text>
          <Text style={styles.txDate}>{tx.date ? formatDate(tx.date) : '—'}</Text>
        </View>
        <View style={styles.txRight}>
          <Text style={styles.txMontant}>{formatMontant(tx.montant_net)}</Text>
          <View style={[styles.badge, { backgroundColor: statut.bg }]}>
            <Text style={[styles.badgeText, { color: statut.text }]}>{statut.label}</Text>
          </View>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </View>
  );
}

// ─── Écran ───────────────────────────────────────────────────────────────────

export default function VehiculeDetailScreen({ id, nom, immatriculation }: Readonly<Props>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [filtre, setFiltre]       = useState<Filtre>('tous');
  const [moisActif, setMoisActif] = useState('tous');

  const { commissions, loading, error, refetch } = useCommissionsVehicule(id);

  const moisDisponibles = useMemo(
    () => [...new Set(commissions.map((c) => c.mois))],
    [commissions],
  );

  const groupesFiltres = useMemo(() => {
    const filtered = commissions
      .filter((c) => moisActif === 'tous' || c.mois === moisActif)
      .filter((c) => filtre === 'tous' || c.statut === filtre);

    const byMois: Record<string, CommissionVehicule[]> = {};
    filtered.forEach((c) => {
      if (!byMois[c.mois]) byMois[c.mois] = [];
      byMois[c.mois].push(c);
    });

    return Object.entries(byMois).map(([mois, txs]) => ({
      mois,
      transactions: txs,
      total: txs.reduce((s, t) => s + t.montant_net, 0),
    }));
  }, [commissions, filtre, moisActif]);

  const totalFiltré  = groupesFiltres.reduce((s, g) => s + g.total, 0);
  const nombreFiltré = groupesFiltres.reduce((n, g) => n + g.transactions.length, 0);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refetch} colors={[colors.primary]} tintColor={colors.primary} />
      }>

      {/* Résumé véhicule */}
      <View style={styles.resumeCard}>
        <Text style={styles.resumeNom}>{nom}</Text>
        <Text style={styles.resumeImmat}>{immatriculation}</Text>
        <View style={styles.resumeStats}>
          <View>
            <Text style={styles.resumeStatLabel}>Total</Text>
            <Text style={styles.resumeStatValue}>{formatMontant(totalFiltré)}</Text>
          </View>
          <View style={styles.resumeStatDivider} />
          <View>
            <Text style={styles.resumeStatLabel}>Commandes</Text>
            <Text style={styles.resumeStatValue}>{nombreFiltré}</Text>
          </View>
        </View>
      </View>

      {/* Filtre statut */}
      <FiltreChips actif={filtre} onChange={setFiltre} />

      {/* Filtre mois */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtreList}>
        <TouchableOpacity onPress={() => setMoisActif('tous')} activeOpacity={0.7}
          style={[styles.chip, styles.chipMois, moisActif === 'tous' && styles.chipMoisActive]}>
          <Text style={[styles.chipLabel, moisActif === 'tous' && styles.chipLabelMoisActive]}>Tous les mois</Text>
        </TouchableOpacity>
        {moisDisponibles.map((mois) => (
          <TouchableOpacity key={mois} onPress={() => setMoisActif(mois)} activeOpacity={0.7}
            style={[styles.chip, styles.chipMois, moisActif === mois && styles.chipMoisActive]}>
            <Text style={[styles.chipLabel, moisActif === mois && styles.chipLabelMoisActive]}>{mois}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Contenu */}
      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.danger }]}>{error}</Text>
        </View>
      )}

      {!loading && !error && groupesFiltres.map((groupe) => (
        <View key={groupe.mois} style={styles.groupe}>
          <View style={styles.moisHeader}>
            <Text style={styles.moisTitre}>{groupe.mois}</Text>
            <Text style={styles.moisTotal}>{formatMontant(groupe.total)}</Text>
          </View>
          <View style={styles.txCard}>
            {groupe.transactions.map((tx, index) => (
              <CommissionRow key={tx.id} tx={tx} isLast={index === groupe.transactions.length - 1} />
            ))}
          </View>
        </View>
      ))}

      {!loading && !error && groupesFiltres.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucune commande pour ce filtre</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    scroll: { flex: 1, backgroundColor: colors.background },

    resumeCard:       { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 20, marginHorizontal: 16, marginTop: 16, borderRadius: 16, gap: 12 },
    resumeNom:        { color: '#fff', fontSize: 18, fontWeight: '700' },
    resumeImmat:      { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
    resumeStats:      { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
    resumeStatLabel:  { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
    resumeStatValue:  { color: '#fff', fontSize: 16, fontWeight: '700' },
    resumeStatDivider:{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },

    filtreList:          { paddingHorizontal: 16, paddingVertical: 16, gap: 8 },
    chip:                { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    chipActive:          { backgroundColor: colors.primary, borderColor: colors.primary },
    chipLabel:           { fontSize: 13, fontWeight: '500', color: colors.textMuted },
    chipLabelActive:     { color: '#fff', fontWeight: '600' },
    chipMois:            { backgroundColor: colors.surface, borderColor: colors.border },
    chipMoisActive:      { backgroundColor: colors.cardActive, borderColor: colors.primary },
    chipLabelMoisActive: { color: colors.primary, fontWeight: '600' },

    groupe:    { marginTop: 8, paddingHorizontal: 16, gap: 8 },
    moisHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    moisTitre: { fontSize: 15, fontWeight: '700', color: colors.text },
    moisTotal: { fontSize: 14, fontWeight: '600', color: colors.primary },

    txCard:    { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    txRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    txLeft:    { flex: 1, gap: 3 },
    txRef:     { fontSize: 14, fontWeight: '600', color: colors.text },
    txDate:    { fontSize: 12, color: colors.textMuted },
    txRight:   { alignItems: 'flex-end', gap: 4 },
    txMontant: { fontSize: 14, fontWeight: '700', color: colors.text },
    badge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    separator: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 16 },

    centerBox: { marginTop: 60, alignItems: 'center' },
    empty:     { marginTop: 48, alignItems: 'center', paddingHorizontal: 24 },
    emptyText: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  });
}
