import { useMemo } from 'react';
import {
  ActivityIndicator,
  AppState,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { useVehiculesMine } from '@/features/vehicule/hooks/useVehiculesMine';
import type { VehiculeApi } from '@/features/vehicule/types/vehicule.types';

// ─── Icône par type ───────────────────────────────────────────────────────────

const TYPE_ICONE: Record<string, string> = {
  Camion:   '🚚',
  Vanne:    '🚐',
  Moto:     '🏍️',
  Tricycle: '🛺',
  'Pick-up': '🛻',
  Autre:    '🚗',
};

function icone(type: string) {
  return TYPE_ICONE[type] ?? '🚗';
}

function VehiculeIcon({ photoUrl, type, style }: Readonly<{ photoUrl: string | null; type: string; style: ReturnType<typeof makeStyles> }>) {
  const [erreur, setErreur] = useState(false);

  if (photoUrl && !erreur) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={style.photo}
        resizeMode="cover"
        onError={() => setErreur(true)}
      />
    );
  }
  return <Text style={style.iconText}>{icone(type)}</Text>;
}

// ─── Carte véhicule ──────────────────────────────────────────────────────────

function VehiculeCard({ vehicule }: Readonly<{ vehicule: VehiculeApi }>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  function handlePress() {
    router.push({
      pathname: `/vehicule/${vehicule.id}`,
      params: {
        nom:            vehicule.nom,
        immatriculation: vehicule.immatriculation,
        vehiculeType:   vehicule.type,
        capacite:       String(vehicule.capacite),
        role:           vehicule.role,
        is_active:      vehicule.is_active ? '1' : '0',
        en_livraison:   vehicule.en_livraison ? '1' : '0',
        photo_url:      vehicule.photo_url ?? '',
      },
    });
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress} style={styles.card}>
      <View style={styles.iconBox}>
        <VehiculeIcon photoUrl={vehicule.photo_url} type={vehicule.type} style={styles} />
      </View>

      <View style={styles.infos}>
        <View style={styles.infosTop}>
          <Text style={styles.nom} numberOfLines={1}>{vehicule.nom}</Text>
          <View style={[styles.badge, vehicule.en_livraison ? styles.badgeLivraison : styles.badgeRepos]}>
            <View style={[styles.badgeDot, vehicule.en_livraison ? styles.badgeLivraisonDot : styles.badgeReposDot]} />
            <Text style={[styles.badgeText, vehicule.en_livraison ? styles.badgeLivraisonText : styles.badgeReposText]}>
              {vehicule.en_livraison ? 'En livraison' : 'Au repos'}
            </Text>
          </View>
        </View>

        <Text style={styles.immat}>{vehicule.immatriculation}</Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Type</Text>
            <Text style={styles.metaValue}>{vehicule.type}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Capacité</Text>
            <Text style={styles.metaValue}>{vehicule.capacite} packs</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Rôle</Text>
            <Text style={styles.metaValue}>
              {vehicule.role === 'proprietaire' ? 'Propriétaire' : 'Livreur'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── États spéciaux ──────────────────────────────────────────────────────────

function LoadingState() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.centerBox}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.centerText}>Chargement des véhicules…</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: Readonly<{ message: string; onRetry: () => void }>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.centerBox}>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity activeOpacity={0.8} onPress={onRetry} style={styles.retryBtn}>
        <Text style={styles.retryBtnText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.centerBox}>
      <Text style={styles.emptyIcon}>🚗</Text>
      <Text style={styles.emptyTitle}>Aucun véhicule</Text>
      <Text style={styles.emptyText}>Vous n'avez pas encore de véhicule associé à votre compte.</Text>
    </View>
  );
}

// ─── Écran principal ─────────────────────────────────────────────────────────

export default function VehiculesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { vehicules, loading, refreshing, error, load, refetch } = useVehiculesMine();

  useEffect(() => { load(); }, [load]);

  useFocusEffect(
    useCallback(() => { refetch(); }, [refetch])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refetch();
    });
    return () => sub.remove();
  }, [refetch]);

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error)   return <ErrorState message={error} onRetry={refetch} />;
    if (vehicules.length === 0) return <EmptyState />;

    return (
      <>
        <Text style={styles.sousTitre}>
          {vehicules.length} véhicule{vehicules.length > 1 ? 's' : ''}
        </Text>
        <View style={styles.liste}>
          {vehicules.map((v) => <VehiculeCard key={v.id} vehicule={v} />)}
        </View>
      </>
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }>
        <Text style={styles.titre}>Mes véhicules</Text>
        {renderContent()}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => router.push('/vehicule/proposer')}>
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabLabel}>Proposer un véhicule</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    wrapper:   { flex: 1, backgroundColor: colors.background },
    scroll:    { flex: 1 },
    content:   { paddingHorizontal: 16 },
    titre:     { fontSize: 24, fontWeight: '700', color: colors.text },
    sousTitre: { fontSize: 14, color: colors.textMuted, marginTop: 2, marginBottom: 20 },
    liste:     { gap: 12 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    iconBox: {
      width: 52, height: 52, borderRadius: 14,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    },
    photo:    { width: 52, height: 52, borderRadius: 14 },
    iconText: { fontSize: 26 },
    infos:    { flex: 1, gap: 4 },
    infosTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    nom:      { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
    immat:    { fontSize: 13, color: colors.textMuted },
    meta:     { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
    metaItem: { gap: 1 },
    metaLabel:{ fontSize: 11, color: colors.textMuted },
    metaValue:{ fontSize: 13, fontWeight: '600', color: colors.text },
    metaDivider: { width: 1, height: 28, backgroundColor: colors.border },

    badge:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
    badgeDot: { width: 7, height: 7, borderRadius: 4 },
    badgeText:{ fontSize: 12, fontWeight: '600' },

    badgeLivraison:    { backgroundColor: colors.infoBg },
    badgeLivraisonDot: { backgroundColor: colors.primary },
    badgeLivraisonText:{ color: colors.primary },

    badgeRepos:    { backgroundColor: colors.surfaceAlt },
    badgeReposDot: { backgroundColor: colors.textMuted },
    badgeReposText:{ color: colors.textMuted },
    chevron:        { fontSize: 22, color: colors.textLight },

    centerBox:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
    centerText: { fontSize: 14, color: colors.textMuted, marginTop: 8 },
    errorText:  { fontSize: 14, color: colors.danger, textAlign: 'center', paddingHorizontal: 16 },
    retryBtn:   { marginTop: 4, backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
    retryBtnText: { color: colors.primaryFg, fontWeight: '600', fontSize: 14 },
    emptyIcon:  { fontSize: 48 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    emptyText:  { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },

    fab: {
      position: 'absolute', right: 20,
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 14, paddingHorizontal: 20,
      borderRadius: 28, gap: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
    },
    fabIcon:  { color: colors.primaryFg, fontSize: 22, fontWeight: '300', lineHeight: 24 },
    fabLabel: { color: colors.primaryFg, fontSize: 14, fontWeight: '600' },
  });
}
