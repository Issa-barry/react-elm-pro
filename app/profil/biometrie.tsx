import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import type { Colors } from '@/shared/constants/theme';

export default function BiometrieScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reconnaissance faciale</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons name="scan-circle-outline" size={64} color={colors.primary} />
        </View>

        <Text style={styles.title}>Face ID / Empreinte digitale</Text>
        <Text style={styles.subtitle}>Disponible prochainement</Text>
        <Text style={styles.desc}>
          L&apos;authentification biométrique vous permettra de vous connecter rapidement et en toute sécurité sans saisir votre mot de passe.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Activer la biométrie</Text>
              <Text style={styles.rowDesc}>Fonctionnalité non disponible</Text>
            </View>
            <Switch
              value={false}
              disabled
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.badge}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
          <Text style={styles.badgeText}>Cette fonctionnalité est en cours de développement.</Text>
        </View>
      </View>
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    root:         { flex: 1, backgroundColor: colors.background },
    header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    backBtn:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
    headerTitle:  { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
    headerSpacer: { width: 36 },
    content:      { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, gap: 12 },
    iconWrapper:  { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    title:        { fontSize: 20, fontWeight: '700', color: colors.text },
    subtitle:     { fontSize: 13, fontWeight: '600', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 },
    desc:         { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: 8 },
    card:         { width: '100%', backgroundColor: colors.surface, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
    row:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
    rowLabel:     { fontSize: 15, color: colors.textMuted, marginBottom: 2 },
    rowDesc:      { fontSize: 12, color: colors.textMuted },
    badge:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primaryLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
    badgeText:    { fontSize: 12, color: colors.primary, flex: 1 },
  });
}
