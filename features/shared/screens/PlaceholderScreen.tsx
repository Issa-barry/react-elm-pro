import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMemo } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { IconSymbol } from '@/shared/components/ui/icon-symbol';
import type { Colors } from '@/shared/constants/theme';

interface Props {
  titre: string;
  icone: Parameters<typeof IconSymbol>[0]['name'];
}

export default function PlaceholderScreen({ titre, icone }: Readonly<Props>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backLabel}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{titre}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Contenu */}
      <View style={styles.body}>
        <View style={styles.iconBox}>
          <IconSymbol name={icone} size={36} color={colors.primary} />
        </View>
        <Text style={styles.titre}>{titre}</Text>
        <Text style={styles.sousTitre}>Cette section est en cours de développement.</Text>
      </View>
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 2,
      minWidth: 80,
    },
    backLabel:    { fontSize: 16, color: colors.primary },
    headerTitle:  { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
    headerSpacer: { minWidth: 80 },
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      paddingHorizontal: 40,
    },
    iconBox: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titre:    { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
    sousTitre:{ fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  });
}
