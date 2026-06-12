import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';

type ColorKey = 'primary' | 'success' | 'warning' | 'danger';

interface Props {
  label: string;
  value: string;
  color?: ColorKey;
  subtitle?: string;
}

function resolveColor(colors: typeof Colors, key: ColorKey = 'primary'): { fg: string; bg: string } {
  const map: Record<ColorKey, { fg: string; bg: string }> = {
    primary: { fg: colors.primary,  bg: colors.primaryLight    },
    success: { fg: colors.success,  bg: colors.successBg       },
    warning: { fg: colors.warning,  bg: colors.warningBg       },
    danger:  { fg: colors.danger,   bg: colors.dangerBg        },
  };
  return map[key];
}

export function StatCard({ label, value, color = 'primary', subtitle }: Props) {
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);
  const { fg, bg } = resolveColor(colors, color);

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: bg }]}>
        <Text style={[styles.value, { color: fg }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      </View>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    card: {
      flex:            1,
      backgroundColor: colors.surface,
      borderRadius:    14,
      borderWidth:     1,
      borderColor:     colors.border,
      padding:         14,
      gap:             8,
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 1 },
      shadowOpacity:   0.05,
      shadowRadius:    4,
      elevation:       1,
    },
    accent: {
      borderRadius:  10,
      paddingVertical:   8,
      paddingHorizontal: 10,
      alignSelf:     'flex-start',
      minWidth:      56,
    },
    value: {
      fontSize:   20,
      fontWeight: '800',
    },
    label: {
      fontSize:   12,
      fontWeight: '500',
      color:      colors.textMuted,
      lineHeight: 16,
    },
    subtitle: {
      fontSize: 11,
      color:    colors.textLight,
    },
  });
}
