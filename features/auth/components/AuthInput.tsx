import { useMemo } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  locked?: boolean;
}

export function AuthInput({ label, error, locked, style, ...rest }: Readonly<Props>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputRow,
        error  ? styles.inputError  : undefined,
        locked ? styles.inputLocked : undefined,
      ]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
          editable={!locked}
          {...rest}
        />
        {locked && (
          <Ionicons name="lock-closed" size={16} color={colors.textLight} style={styles.lockIcon} />
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    wrapper: { gap: 6 },
    label:   { fontSize: 14, fontWeight: '600', color: colors.text },

    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 50,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
    },
    inputError:  { borderColor: colors.danger },
    inputLocked: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },

    input: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    lockIcon: { marginLeft: 6 },
    error: { fontSize: 12, color: colors.danger, marginTop: 2 },
  });
}
