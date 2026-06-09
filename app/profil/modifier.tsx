import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { Colors } from '@/shared/constants/theme';

export default function ModifierProfilScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useCurrentUser();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 16 }}>
        <View style={styles.infoBox}>
          <Ionicons name="lock-closed" size={14} color={colors.primary} />
          <Text style={styles.infoText}>La modification du profil se fait via notre support client.</Text>
        </View>

        <Field label="Prénom" value={user?.prenom} styles={styles} colors={colors} />
        <Field label="Nom" value={user?.nom} styles={styles} colors={colors} />
        <Field label="Téléphone" value={user?.telephone} styles={styles} colors={colors} />
        <Field label="Email" value={user?.email} styles={styles} colors={colors} />

        <TouchableOpacity style={[styles.saveBtn, styles.saveBtnDisabled]} disabled>
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, value, styles, colors }: {
  label: string;
  value?: string | null;
  styles: ReturnType<typeof makeStyles>;
  colors: typeof Colors;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value ?? ''}
        editable={false}
        selectTextOnFocus={false}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    root:           { flex: 1, backgroundColor: colors.background },
    header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    backBtn:        { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
    headerTitle:    { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
    headerSpacer:   { width: 36 },
    infoBox:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primaryLight, borderRadius: 10, padding: 12 },
    infoText:       { flex: 1, fontSize: 13, color: colors.primary },
    label:          { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
    input:          { backgroundColor: colors.surfaceAlt, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.textMuted },
    saveBtn:        { marginTop: 8, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
    saveBtnDisabled:{ opacity: 0.4 },
    saveBtnText:    { fontSize: 15, fontWeight: '700', color: '#fff' },
  });
}
