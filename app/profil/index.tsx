import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { getInitiales } from '@/shared/utils/initiales';
import type { Colors } from '@/shared/constants/theme';

type ThemeColors = typeof Colors;

// ── Composant item de section ─────────────────────────────────────────────────

function SectionItem({
  icon,
  label,
  onPress,
  danger = false,
  colors,
  styles,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
  colors: ThemeColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.itemIcon, { backgroundColor: danger ? colors.dangerBg : colors.primaryLight }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.itemLabel, danger && { color: colors.danger }]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
    </TouchableOpacity>
  );
}

function InfoItem({
  icon,
  label,
  colors,
  styles,
}: Readonly<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  colors: ThemeColors;
  styles: ReturnType<typeof makeStyles>;
}>) {
  return (
    <View style={styles.item}>
      <View style={[styles.itemIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
    </View>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useCurrentUser();
  const { logout } = useLogout();

  const initiales = getInitiales(user?.prenom, user?.nom);
  const nomComplet = user ? `${user.prenom} ${user.nom}`.trim() : '—';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initiales}</Text>
          </View>
          <Text style={styles.name}>{nomComplet}</Text>
          {!!user?.email && <Text style={styles.muted}>{user.email}</Text>}
          {!!user?.telephone && <Text style={styles.muted}>{user.telephone}</Text>}
        </View>

        {/* Mon compte */}
        <Text style={styles.sectionTitle}>Mon compte</Text>
        <View style={styles.card}>
          <SectionItem icon="lock-closed-outline" label="Modifier le profil"
            onPress={() => router.push('/profil/modifier')} colors={colors} styles={styles} />
        </View>

        {/* Services */}
        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.card}>
          <InfoItem icon="cube-outline" label="Livraisons" colors={colors} styles={styles} />
          <View style={styles.divider} />
          <InfoItem icon="car-outline" label="Véhicules" colors={colors} styles={styles} />
        </View>

        {/* Sécurité */}
        <Text style={styles.sectionTitle}>Sécurité</Text>
        <View style={styles.card}>
          <SectionItem icon="scan-circle-outline" label="Reconnaissance faciale"
            onPress={() => router.push('/profil/biometrie')} colors={colors} styles={styles} />
          <View style={styles.divider} />
          <SectionItem icon="key-outline" label="Modifier le mot de passe"
            onPress={() => router.push('/profil/mot-de-passe')} colors={colors} styles={styles} />
        </View>

        {/* Paramètres */}
        <Text style={styles.sectionTitle}>Paramètres</Text>
        <View style={styles.card}>
          <SectionItem icon="notifications-outline" label="Notifications"
            onPress={() => router.push('/profil/notifications')} colors={colors} styles={styles} />
          <View style={styles.divider} />
          <SectionItem icon="help-circle-outline" label="Contact"
            onPress={() => router.push('/profil/contact')} colors={colors} styles={styles} />
          <View style={styles.divider} />
          <SectionItem icon="document-text-outline" label="Conditions d'utilisation"
            onPress={() => router.push('/profil/conditions')} colors={colors} styles={styles} />
        </View>

        {/* Déconnexion */}
        <View style={styles.logoutWrapper}>
          <SectionItem icon="log-out-outline" label="Se déconnecter"
            onPress={logout} danger colors={colors} styles={styles} />
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root:          { flex: 1, backgroundColor: colors.background },
    header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    closeBtn:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
    headerTitle:   { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
    headerSpacer:  { width: 36 },
    avatarSection: { alignItems: 'center', paddingVertical: 28, backgroundColor: colors.surface, marginBottom: 8 },
    avatar:        { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarText:    { fontSize: 26, fontWeight: '700', color: '#fff' },
    name:          { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
    muted:         { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
    sectionTitle:  { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 20, marginBottom: 6, paddingHorizontal: 20 },
    card:          { backgroundColor: colors.surface, marginHorizontal: 0, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
    item:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
    itemIcon:      { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    itemLabel:     { flex: 1, fontSize: 15, color: colors.text },
    divider:       { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 66 },
    logoutWrapper: { marginTop: 20, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  });
}
