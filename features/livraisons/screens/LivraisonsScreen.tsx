import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { IconSymbol } from '@/shared/components/ui/icon-symbol';
import { useVehiculesMine } from '@/features/vehicule/hooks/useVehiculesMine';
import { useLivraisonsEnCours } from '../hooks/useLivraisonsEnCours';
import type { LivraisonEnCours } from '../types/livraison.types';

const TYPE_ICONE: Record<string, string> = {
  Camion: '🚚', Vanne: '🚐', Moto: '🏍️', Tricycle: '🛺', 'Pick-up': '🛻', Autre: '🚗',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Photo véhicule ──────────────────────────────────────────────────────────

function VehiculePhoto({ photoUrl, type, size }: Readonly<{ photoUrl: string | null; type: string; size: number }>) {
  const { colors } = useTheme();
  const [erreur, setErreur] = useState(false);
  const radius = size * 0.25;

  if (photoUrl && !erreur) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={{ width: size, height: size, borderRadius: radius }}
        resizeMode="cover"
        onError={() => setErreur(true)}
      />
    );
  }
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.48 }}>{TYPE_ICONE[type] ?? '🚗'}</Text>
    </View>
  );
}

// ─── Bottom sheet détail ─────────────────────────────────────────────────────

interface DetailSheetProps {
  item: LivraisonEnCours;
  photoUrl: string | null;
  vehiculeType: string;
  onClose: () => void;
}

function DetailSheet({ item, photoUrl, vehiculeType, onClose }: Readonly<DetailSheetProps>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Poignée */}
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 16 }]}>
            {/* En-tête du sheet */}
            <View style={styles.sheetHeader}>
              <VehiculePhoto photoUrl={photoUrl} type={vehiculeType} size={52} />
              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetRef}>{item.reference}</Text>
                {item.vehicule && (
                  <Text style={styles.sheetVehicule}>{item.vehicule.nom} · {item.vehicule.immatriculation}</Text>
                )}
              </View>
              <View style={styles.sheetBadge}>
                <View style={styles.sheetBadgeDot} />
                <Text style={styles.sheetBadgeLabel}>En cours</Text>
              </View>
            </View>

            <View style={styles.sheetDivider} />

            {/* Trajet */}
            <View style={styles.sheetSection}>
              <Text style={styles.sheetSectionTitle}>Trajet</Text>
              <View style={styles.routeCol}>
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, styles.routeDotSource]} />
                  <Text style={styles.routeNom}>{item.site_source}</Text>
                </View>
                <View style={styles.routeVertLine} />
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, styles.routeDotDest]} />
                  <Text style={styles.routeNom}>{item.site_destination}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sheetDivider} />

            {/* Détails */}
            <View style={styles.sheetSection}>
              <Text style={styles.sheetSectionTitle}>Détails</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Packs</Text>
                  <Text style={styles.detailValue}>{item.nb_packs}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Équipe</Text>
                  <Text style={styles.detailValue}>{item.equipe_nom || '—'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Départ</Text>
                  <Text style={styles.detailValue}>{formatDate(item.date_depart)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Arrivée prévue</Text>
                  <Text style={styles.detailValue}>{formatDate(item.date_arrivee_prevue)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sheetDivider} />

            {/* QR Code */}
            <View style={styles.sheetSection}>
              <Text style={styles.sheetSectionTitle}>Code QR</Text>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={`${process.env.EXPO_PUBLIC_API_URL ?? ''}/scan/livraison/${item.reference}`}
                  size={180}
                  color="#000000"
                  backgroundColor="#ffffff"
                />
              </View>
              <Text style={styles.qrRef}>{item.reference}</Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Carte simple ────────────────────────────────────────────────────────────

interface CardProps {
  item: LivraisonEnCours;
  photoUrl: string | null;
  vehiculeType: string;
  onPress: () => void;
}

function LivraisonCard({ item, photoUrl, vehiculeType, onPress }: Readonly<CardProps>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <VehiculePhoto photoUrl={photoUrl} type={vehiculeType} size={48} />
      <View style={styles.cardBody}>
        <Text style={styles.cardRef}>{item.reference}</Text>
        {item.vehicule && (
          <Text style={styles.cardVehicule} numberOfLines={1}>
            {item.vehicule.nom} · {item.vehicule.immatriculation}
          </Text>
        )}
      </View>
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeLabel}>En cours</Text>
      </View>
      <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
    </TouchableOpacity>
  );
}

// ─── Écran ───────────────────────────────────────────────────────────────────

export default function LivraisonsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { livraisons, loading, refreshing, error, load, refetch } = useLivraisonsEnCours();
  const { vehicules, load: loadVehicules } = useVehiculesMine();
  const [selected, setSelected] = useState<LivraisonEnCours | null>(null);

  const vehiculeMap = useMemo(() => {
    const m: Record<string, { photo_url: string | null; type: string }> = {};
    vehicules.forEach(v => { m[v.immatriculation] = { photo_url: v.photo_url, type: v.type }; });
    return m;
  }, [vehicules]);

  useEffect(() => { load(); loadVehicules(); }, [load, loadVehicules]);
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => { if (s === 'active') refetch(); });
    return () => sub.remove();
  }, [refetch]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} colors={[colors.primary]} tintColor={colors.primary} />
        }>

        <Text style={styles.titre}>Livraisons en cours</Text>

        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {!loading && error && (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} activeOpacity={0.8} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && livraisons.length === 0 && (
          <View style={styles.centerBox}>
            <Text style={styles.emptyIcon}>🚚</Text>
            <Text style={styles.emptyTitle}>Aucune livraison en cours</Text>
            <Text style={styles.emptyText}>Vos véhicules sont au repos.</Text>
          </View>
        )}

        {!loading && !error && livraisons.length > 0 && (
          <>
            <Text style={styles.sousTitre}>
              {livraisons.length} livraison{livraisons.length > 1 ? 's' : ''} active{livraisons.length > 1 ? 's' : ''}
            </Text>
            <View style={styles.liste}>
              {livraisons.map(item => {
                const vInfo = item.vehicule ? vehiculeMap[item.vehicule.immatriculation] : null;
                return (
                  <LivraisonCard
                    key={item.id}
                    item={item}
                    photoUrl={vInfo?.photo_url ?? null}
                    vehiculeType={vInfo?.type ?? item.vehicule?.type ?? ''}
                    onPress={() => setSelected(item)}
                  />
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {selected && (() => {
        const vInfo = selected.vehicule ? vehiculeMap[selected.vehicule.immatriculation] : null;
        return (
          <DetailSheet
            item={selected}
            photoUrl={vInfo?.photo_url ?? null}
            vehiculeType={vInfo?.type ?? selected.vehicule?.type ?? ''}
            onClose={() => setSelected(null)}
          />
        );
      })()}
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
    sousTitre: { fontSize: 14, color: colors.textMuted, marginTop: 2, marginBottom: 16 },
    liste:     { gap: 10 },

    // Carte simple
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    cardBody:    { flex: 1, gap: 3 },
    cardRef:     { fontSize: 15, fontWeight: '700', color: colors.text },
    cardVehicule:{ fontSize: 13, color: colors.textMuted },

    badge: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: colors.infoBg,
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    },
    badgeDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
    badgeLabel: { fontSize: 12, fontWeight: '600', color: colors.primary },

    // Bottom sheet
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      maxHeight: '85%',
    },
    handle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 8,
    },
    sheetContent: { gap: 16 },
    sheetHeader:     { flexDirection: 'row', alignItems: 'center', gap: 14 },
    sheetHeaderText: { flex: 1, gap: 3 },
    sheetRef:        { fontSize: 16, fontWeight: '700', color: colors.text },
    sheetVehicule:   { fontSize: 13, color: colors.textMuted },
    sheetBadge:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.infoBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    sheetBadgeDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
    sheetBadgeLabel: { fontSize: 12, fontWeight: '600', color: colors.primary },

    sheetDivider: { height: 1, backgroundColor: colors.borderLight },

    sheetSection:      { gap: 10 },
    sheetSectionTitle: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },

    routeCol:       { gap: 4, paddingLeft: 4 },
    routeRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
    routeVertLine:  { width: 1, height: 16, backgroundColor: colors.border, marginLeft: 5 },
    routeDot:       { width: 10, height: 10, borderRadius: 5 },
    routeDotSource: { backgroundColor: colors.textMuted },
    routeDotDest:   { backgroundColor: colors.primary },
    routeNom:       { fontSize: 15, fontWeight: '600', color: colors.text },

    detailGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    detailItem:  { width: '45%', gap: 2 },
    detailLabel: { fontSize: 11, color: colors.textMuted },
    detailValue: { fontSize: 14, fontWeight: '600', color: colors.text },

    qrWrapper: {
      alignSelf: 'center',
      padding: 14,
      borderRadius: 16,
      backgroundColor: '#ffffff',
    },
    qrRef: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
      letterSpacing: 0.8,
      marginTop: 4,
    },

    centerBox:    { marginTop: 60, alignItems: 'center', gap: 12 },
    errorText:    { fontSize: 14, color: colors.danger, textAlign: 'center' },
    retryBtn:     { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
    retryBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    emptyIcon:    { fontSize: 48 },
    emptyTitle:   { fontSize: 18, fontWeight: '700', color: colors.text },
    emptyText:    { fontSize: 14, color: colors.textMuted },
  });
}
