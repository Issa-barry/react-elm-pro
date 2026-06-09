import { useMemo, useState } from 'react';
import {
  StyleSheet, Text, TextInput, TouchableOpacity, View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface Props extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
  error?: string;
}

export function PasswordInput({ label, error, style, ...rest }: Readonly<Props>) {
  const [visible, setVisible] = useState(false);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, error ? styles.rowError : undefined]}>
        <TextInput
          style={[styles.input, style]}
          secureTextEntry={!visible}
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
          autoComplete="password"
          {...rest}
        />
        <TouchableOpacity onPress={() => setVisible(v => !v)} style={styles.toggle} accessibilityLabel={visible ? 'Masquer' : 'Afficher'}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    wrapper: { gap: 6 },
    label: { fontSize: 14, fontWeight: '600', color: colors.text },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 50,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
    },
    rowError: { borderColor: colors.danger },
    input: { flex: 1, fontSize: 15, color: colors.text },
    toggle: { paddingLeft: 8 },
    error: { fontSize: 12, color: colors.danger, marginTop: 2 },
  });
}
