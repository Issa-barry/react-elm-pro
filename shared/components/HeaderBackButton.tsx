import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '@/shared/contexts/ThemeContext';

interface Props {
  label?: string;
}

export function HeaderBackButton({ label = 'Retour' }: Readonly<Props>) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.btn} hitSlop={12} activeOpacity={0.6}>
      <Text style={[styles.label, { color: colors.primary }]}>‹ {label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn:   { paddingRight: 8 },
  label: { fontSize: 17 },
});
