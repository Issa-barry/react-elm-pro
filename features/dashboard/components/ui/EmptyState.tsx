import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface Props {
  icon?:     React.ComponentProps<typeof Ionicons>['name'];
  title:     string;
  subtitle?: string;
}

export function EmptyState({ icon = 'file-tray-outline', title, subtitle }: Props) {
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={28} color={colors.textLight} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: {
      alignItems:    'center',
      paddingVertical: 32,
      gap:           10,
    },
    iconBox: {
      width:         56,
      height:        56,
      borderRadius:  16,
      alignItems:    'center',
      justifyContent: 'center',
    },
    title: {
      fontSize:   14,
      fontWeight: '600',
      color:      colors.textMuted,
    },
    subtitle: {
      fontSize: 12,
      color:    colors.textLight,
      textAlign: 'center',
    },
  });
}
