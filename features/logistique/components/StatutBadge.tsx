import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { StatutTransfert } from '../types/logistique.types';

interface Props {
  statut: StatutTransfert | string;
  label: string;
}

export function StatutBadge({ statut, label }: Props) {
  const { colors } = useTheme();

  const map: Record<string, { bg: string; text: string }> = {
    brouillon:  { bg: colors.surfaceAlt, text: colors.textMuted },
    chargement: { bg: colors.warningBg,  text: colors.warning },
    transit:    { bg: colors.infoBg,     text: colors.primary },
    reception:  { bg: '#ccfdf4',         text: '#0d9488' },
    cloture:    { bg: colors.successBg,  text: colors.success },
    annule:     { bg: colors.dangerBg,   text: colors.danger },
  };

  const c = map[statut] ?? map.brouillon;

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  label: { fontSize: 12, fontWeight: '600' },
});
