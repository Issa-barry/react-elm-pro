import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import type { RoleVehicule } from '../types/vehicule.types';

const TYPE_ICONE: Record<string, string> = {
  Camion:    '🚚',
  Vanne:     '🚐',
  Moto:      '🏍️',
  Tricycle:  '🛺',
  'Pick-up': '🛻',
  Autre:     '🚗',
};

interface Props {
  nom:            string;
  immatriculation: string;
  type:           string;
  capacite:       number;
  role:           RoleVehicule;
  is_active:      boolean;
  en_livraison:   boolean;
  photo_url:      string | null;
}

function InfoRow({ label, value, accent }: Readonly<{ label: string; value: string; accent?: boolean }>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent && { color: colors.primary }]}>{value}</Text>
    </View>
  );
}

export default function VehiculeCaracteristiquesScreen({
  nom,
  immatriculation,
  type,
  capacite,
  role,
  is_active,
  en_livraison,
  photo_url,
}: Readonly<Props>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const icone = TYPE_ICONE[type] ?? '🚗';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}>

      {/* Photo / icône */}
      <View style={styles.photoSection}>
        {photo_url ? (
          <Image source={{ uri: photo_url }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>{icone}</Text>
          </View>
        )}
      </View>

      {/* Nom + immat */}
      <Text style={styles.nom}>{nom}</Text>
      <Text style={styles.immat}>{immatriculation}</Text>

      {/* Statuts */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, is_active ? styles.badgeActive : styles.badgeInactive]}>
          <View style={[styles.dot, is_active ? styles.dotActive : styles.dotInactive]} />
          <Text style={[styles.badgeText, is_active ? styles.badgeTextActive : styles.badgeTextInactive]}>
            {is_active ? 'Actif' : 'Inactif'}
          </Text>
        </View>
        <View style={[styles.badge, en_livraison ? styles.badgeLivraison : styles.badgeRepos]}>
          <View style={[styles.dot, en_livraison ? styles.dotLivraison : styles.dotRepos]} />
          <Text style={[styles.badgeText, en_livraison ? styles.badgeTextLivraison : styles.badgeTextRepos]}>
            {en_livraison ? 'En livraison' : 'Au repos'}
          </Text>
        </View>
      </View>

      {/* Fiche détaillée */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informations</Text>
        <View style={styles.separator} />
        <InfoRow label="Type"           value={type} />
        <View style={styles.separator} />
        <InfoRow label="Capacité"       value={`${capacite} packs`} />
        <View style={styles.separator} />
        <InfoRow label="Immatriculation" value={immatriculation} />
        <View style={styles.separator} />
        <InfoRow label="Rôle"           value={role === 'proprietaire' ? 'Propriétaire' : 'Livreur'} accent />
      </View>

    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    scroll:  { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 16, paddingTop: 24, gap: 8, alignItems: 'center' },

    photoSection: { marginBottom: 8 },
    photo:    { width: 110, height: 110, borderRadius: 20 },
    iconBox:  { width: 110, height: 110, borderRadius: 20, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    iconText: { fontSize: 52 },

    nom:   { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
    immat: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 4 },

    badgeRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    badge:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    dot:      { width: 7, height: 7, borderRadius: 4 },
    badgeText: { fontSize: 13, fontWeight: '600' },

    badgeActive:      { backgroundColor: colors.successBg },
    dotActive:        { backgroundColor: colors.success },
    badgeTextActive:  { color: colors.success },
    badgeInactive:    { backgroundColor: colors.surfaceAlt },
    dotInactive:      { backgroundColor: colors.textMuted },
    badgeTextInactive:{ color: colors.textMuted },

    badgeLivraison:    { backgroundColor: colors.infoBg },
    dotLivraison:      { backgroundColor: colors.primary },
    badgeTextLivraison:{ color: colors.primary },
    badgeRepos:        { backgroundColor: colors.surfaceAlt },
    dotRepos:          { backgroundColor: colors.textMuted },
    badgeTextRepos:    { color: colors.textMuted },

    card:       { width: '100%', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginTop: 8 },
    cardTitle:  { fontSize: 13, fontWeight: '700', color: colors.textMuted, paddingHorizontal: 16, paddingVertical: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
    separator:  { height: 1, backgroundColor: colors.borderLight },

    row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    rowLabel:  { fontSize: 14, color: colors.textMuted },
    rowValue:  { fontSize: 14, fontWeight: '600', color: colors.text },
  });
}
