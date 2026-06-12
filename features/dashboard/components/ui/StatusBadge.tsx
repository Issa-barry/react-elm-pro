import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

interface Props {
  label:   string;
  variant: BadgeVariant;
}

export function StatusBadge({ label, variant }: Props) {
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);
  const variantStyle = styles[variant];

  return (
    <View style={[styles.badge, variantStyle]}>
      <Text style={[styles.label, { color: LABEL_COLORS(colors)[variant] }]}>{label}</Text>
    </View>
  );
}

function LABEL_COLORS(c: typeof Colors): Record<BadgeVariant, string> {
  return {
    primary: c.primary,
    success: c.success,
    warning: c.warning,
    danger:  c.danger,
    muted:   c.textMuted,
  };
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    badge: {
      alignSelf:         'flex-start',
      borderRadius:      20,
      paddingVertical:   3,
      paddingHorizontal: 10,
    },
    label: {
      fontSize:   11,
      fontWeight: '600',
    },
    primary: { backgroundColor: colors.primaryLight },
    success: { backgroundColor: colors.successBg    },
    warning: { backgroundColor: colors.warningBg    },
    danger:  { backgroundColor: colors.dangerBg     },
    muted:   { backgroundColor: colors.borderLight  },
  });
}
