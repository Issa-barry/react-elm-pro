import { useMemo, useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface Props {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  length?: number;
}

export function OtpInput({ value, onChange, error, length = 5 }: Readonly<Props>) {
  const refs = useRef<(TextInput | null)[]>([]);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  function handleChange(text: string, index: number) {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next  = value.split('');
    next[index] = digit;
    const joined = next.join('').slice(0, length);
    onChange(joined);
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
    if (!digit && index > 0)         refs.current[index - 1]?.focus();
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  const positions = useMemo(
    () => Array.from({ length }, (_, i) => i),
    [length],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.boxes}>
        {positions.map((pos) => (
          <TextInput
            key={`digit-${pos}`}
            ref={el => { refs.current[pos] = el; }}
            style={[styles.box, value[pos] ? styles.boxFilled : undefined, error ? styles.boxError : undefined]}
            value={value[pos] ?? ''}
            onChangeText={t => handleChange(t, pos)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, pos)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            accessibilityLabel={`Chiffre ${pos + 1} du code`}
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    wrapper: { gap: 8, alignItems: 'center' },
    boxes:   { flexDirection: 'row', gap: 10 },
    box: {
      width: 52, height: 58,
      borderWidth: 1.5, borderColor: colors.border,
      borderRadius: 12,
      textAlign: 'center',
      fontSize: 22, fontWeight: '700', color: colors.text,
      backgroundColor: colors.surface,
    },
    boxFilled: { borderColor: colors.primary, backgroundColor: colors.cardActive },
    boxError:  { borderColor: colors.danger },
    error:     { fontSize: 12, color: colors.danger },
  });
}
