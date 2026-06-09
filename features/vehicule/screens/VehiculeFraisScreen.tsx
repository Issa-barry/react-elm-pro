import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { formatMontant, formatDate } from '@/shared/utils/format';
import { useFraisVehicule } from '../hooks/useFraisVehicule';
import type { FraisApi } from '../types/frais.types';

interface Props {
  id: string;
  nom: string;
  immatriculation: string;
}

// ─── Config catégories ────────────────────────────────────────────────────────

const ICONE_PAR_CODE: Record<string, string> = {
  carburant:  '⛽',
  reparation: '🔧',
  entretien:  '🛠️',
  pneus:      '🔵',
  lavage:     '🫧',
  autre:      '📋',
};

function iconeType(code: string): string {
  return ICONE_PAR_CODE[code] ?? '📋';
}

const FILTRE_TOUS = 'tous';

// ─── Composants ──────────────────────────────────────────────────────────────

function getStatut(statut: string, colors: ReturnType<typeof useTheme>['colors']) {
  if (statut === 'approuve') return { label: 'Approuvé', color: colors.success, bg: colors.successBg };
  if (statut === 'rejete')   return { label: 'Rejeté',   color: colors.danger,  bg: colors.dangerBg  };
  return                             { label: 'En attente', color: colors.warning, bg: colors.warningBg };
}

function FraisRow({ item }: Readonly<{ item: FraisApi }>) {
  const { colors } = useTheme();
  const styles  = useMemo(() => makeStyles(colors), [colors]);
  const statut  = getStatut(item.statut, colors);

  return (
    <View style={styles.row}>
      <View style={styles.rowIconBox}>
        <Text style={styles.rowIconText}>{iconeType(item.type_code)}</Text>
      </View>
      <View style={styles.rowLeft}>
        <Text style={styles.rowRef}>{item.type_label}</Text>
        <Text style={styles.rowMeta}>{item.date ? formatDate(item.date) : '—'}</Text>
        {item.commentaire ? <Text style={styles.rowComment} numberOfLines={1}>{item.commentaire}</Text> : null}
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowMontant}>{formatMontant(item.montant)}</Text>
        <View style={[styles.badge, { backgroundColor: statut.bg }]}>
          <Text style={[styles.badgeText, { color: statut.color }]}>{statut.label}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Écran principal ─────────────────────────────────────────────────────────

export default function VehiculeFraisScreen({ id, nom, immatriculation }: Readonly<Props>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [filtreCode, setFiltreCode] = useState<string>(FILTRE_TOUS);
  const [moisActif, setMoisActif]   = useState<string>(FILTRE_TOUS);
  const [refreshing, setRefreshing] = useState(false);

  const { frais, loading, error, load } = useFraisVehicule(id);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const categories = useMemo(() => {
    const seen = new Set<string>();
    return frais.filter(f => {
      if (seen.has(f.type_code)) return false;
      seen.add(f.type_code);
      return true;
    }).map(f => ({ code: f.type_code, label: f.type_label }));
  }, [frais]);

  const moisDisponibles = useMemo(
    () => [...new Set(frais.map(f => f.mois))],
    [frais],
  );

  const groupes = useMemo(() => {
    const filtered = frais
      .filter(f => moisActif === FILTRE_TOUS || f.mois === moisActif)
      .filter(f => filtreCode === FILTRE_TOUS || f.type_code === filtreCode);

    const byMois: Record<string, FraisApi[]> = {};
    filtered.forEach(f => {
      if (!byMois[f.mois]) byMois[f.mois] = [];
      byMois[f.mois].push(f);
    });

    return Object.entries(byMois).map(([mois, items]) => ({
      mois,
      items,
      total: items.reduce((s, i) => s + i.montant, 0),
    }));
  }, [frais, filtreCode, moisActif]);

  const totalFiltré  = groupes.reduce((s, g) => s + g.total, 0);
  const nombreFiltré = groupes.reduce((n, g) => n + g.items.length, 0);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />
      }>

      {/* Résumé */}
      <View style={styles.resumeCard}>
        <Text style={styles.resumeNom}>{nom}</Text>
        <Text style={styles.resumeImmat}>{immatriculation}</Text>
        <View style={styles.resumeStats}>
          <View>
            <Text style={styles.resumeStatLabel}>Total frais</Text>
            <Text style={styles.resumeStatValue}>{formatMontant(totalFiltré)}</Text>
          </View>
          <View style={styles.resumeStatDivider} />
          <View>
            <Text style={styles.resumeStatLabel}>Dépenses</Text>
            <Text style={styles.resumeStatValue}>{nombreFiltré}</Text>
          </View>
        </View>
      </View>

      {/* Filtre catégorie */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtreList}>
        <TouchableOpacity
          key={FILTRE_TOUS}
          onPress={() => setFiltreCode(FILTRE_TOUS)}
          activeOpacity={0.7}
          style={[styles.chip, filtreCode === FILTRE_TOUS && styles.chipActive]}>
          <Text style={[styles.chipLabel, filtreCode === FILTRE_TOUS && styles.chipLabelActive]}>Tous</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.code}
            onPress={() => setFiltreCode(cat.code)}
            activeOpacity={0.7}
            style={[styles.chip, filtreCode === cat.code && styles.chipActive]}>
            <Text style={[styles.chipLabel, filtreCode === cat.code && styles.chipLabelActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filtre mois */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtreList}>
        <TouchableOpacity onPress={() => setMoisActif(FILTRE_TOUS)} activeOpacity={0.7}
          style={[styles.chip, styles.chipMois, moisActif === FILTRE_TOUS && styles.chipMoisActive]}>
          <Text style={[styles.chipLabel, moisActif === FILTRE_TOUS && styles.chipLabelMoisActive]}>Tous les mois</Text>
        </TouchableOpacity>
        {moisDisponibles.map(mois => (
          <TouchableOpacity key={mois} onPress={() => setMoisActif(mois)} activeOpacity={0.7}
            style={[styles.chip, styles.chipMois, moisActif === mois && styles.chipMoisActive]}>
            <Text style={[styles.chipLabel, moisActif === mois && styles.chipLabelMoisActive]}>{mois}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Contenu */}
      {loading && (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && groupes.map(groupe => (
        <View key={groupe.mois} style={styles.groupe}>
          <View style={styles.moisHeader}>
            <Text style={styles.moisTitre}>{groupe.mois}</Text>
            <Text style={styles.moisTotal}>{formatMontant(groupe.total)}</Text>
          </View>
          <View style={styles.card}>
            {groupe.items.map((item, index) => (
              <View key={item.id}>
                <FraisRow item={item} />
                {index < groupe.items.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </View>
      ))}

      {!loading && !error && groupes.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aucun frais pour ce filtre</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    scroll: { flex: 1, backgroundColor: colors.background },

    resumeCard: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20, paddingVertical: 20,
      marginHorizontal: 16, marginTop: 16,
      borderRadius: 16, gap: 12,
    },
    resumeNom:          { color: '#fff', fontSize: 18, fontWeight: '700' },
    resumeImmat:        { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
    resumeStats:        { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
    resumeStatLabel:    { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
    resumeStatValue:    { color: '#fff', fontSize: 16, fontWeight: '700' },
    resumeStatDivider:  { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },

    filtreList:          { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
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

    card:      { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
    rowIconBox:{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    rowIconText:{ fontSize: 18 },
    rowLeft:   { flex: 1, gap: 3 },
    rowRef:    { fontSize: 14, fontWeight: '600', color: colors.text },
    rowMeta:   { fontSize: 12, color: colors.textMuted },
    rowComment:{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
    rowRight:  { alignItems: 'flex-end', gap: 4 },
    rowMontant:{ fontSize: 14, fontWeight: '700', color: colors.text },
    badge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    separator: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 14 },

    center:    { marginTop: 48, alignItems: 'center', paddingHorizontal: 24 },
    errorText: { fontSize: 14, color: colors.danger, textAlign: 'center' },
    emptyText: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  });
}
