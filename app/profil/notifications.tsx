import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEFAULT_PREFS, loadNotifPrefs, saveNotifPrefs } from '@/features/notifications/services/notification-prefs.service';
import type { NotificationPrefs } from '@/features/notifications/services/notification-prefs.service';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { Colors } from '@/shared/constants/theme';

const ITEMS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: 'pushEnabled',      label: 'Notifications push',     description: 'Recevoir des alertes sur cet appareil' },
  { key: 'paiementRecu',     label: 'Paiement reçu',          description: 'Être notifié lors d\'un versement de commission' },
  { key: 'creationCommande', label: 'Nouvelle commande',       description: 'Être notifié lorsqu\'une commande est assignée' },
  { key: 'emailEnabled',     label: 'Notifications par email', description: 'Recevoir un récapitulatif par email' },
  { key: 'nouvelleDepense',  label: 'Nouvelles dépenses',      description: 'Être alerté d\'une dépense enregistrée sur votre véhicule' },
];

export default function NotificationsPrefsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifPrefs().then(p => { setPrefs(p); setLoading(false); });
  }, []);

  async function toggle(key: keyof NotificationPrefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await saveNotifPrefs(next);
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading
        ? <View style={styles.loader}><ActivityIndicator color={colors.primary} /></View>
        : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
            <Text style={styles.sectionTitle}>Préférences</Text>
            <View style={styles.card}>
              {ITEMS.map((item, idx) => (
                <View key={item.key}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.row}>
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                      <Text style={styles.rowDesc}>{item.description}</Text>
                    </View>
                    <Switch
                      value={prefs[item.key]}
                      onValueChange={v => toggle(item.key, v)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>
              ))}
            </View>
            <Text style={styles.hint}>Les préférences sont sauvegardées automatiquement sur cet appareil.</Text>
          </ScrollView>
        )
      }
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    root:        { flex: 1, backgroundColor: colors.background },
    header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    backBtn:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
    headerSpacer:{ width: 36 },
    loader:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
    sectionTitle:{ fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 20, marginBottom: 6, paddingHorizontal: 20 },
    card:        { backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
    row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
    rowText:     { flex: 1 },
    rowLabel:    { fontSize: 15, color: colors.text, marginBottom: 2 },
    rowDesc:     { fontSize: 12, color: colors.textMuted },
    divider:     { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 20 },
    hint:        { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 16, paddingHorizontal: 24 },
  });
}
