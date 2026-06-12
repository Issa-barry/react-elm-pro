import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface Action {
  label:   string;
  onPress: () => void;
}

interface Props {
  title:   string;
  action?: Action;
}

export function SectionHeader({ title, action }: Props) {
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress} activeOpacity={0.7}>
          <Text style={[styles.action, { color: colors.primary }]}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    row: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize:   15,
      fontWeight: '700',
      color:      colors.text,
    },
    action: {
      fontSize:   13,
      fontWeight: '600',
    },
  });
}
