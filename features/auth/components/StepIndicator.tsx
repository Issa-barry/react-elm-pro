import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface Props {
  current: number;
  total: number;
  labels?: string[];
}

export function StepIndicator({ current, total, labels }: Readonly<Props>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const steps = useMemo(() => Array.from({ length: total }, (_, i) => i + 1), [total]);

  function circleStyle(done: boolean, active: boolean) {
    if (done)   return styles.circleDone;
    if (active) return styles.circleActive;
    return styles.circlePending;
  }

  return (
    <View style={styles.wrapper}>
      {steps.map((n) => {
        const done   = n < current;
        const active = n === current;
        return (
          <View key={`step-${n}`} style={styles.item}>
            <View style={[styles.circle, circleStyle(done, active)]}>
              {done
                ? <Text style={styles.check}>✓</Text>
                : <Text style={[styles.num, active ? styles.numActive : styles.numPending]}>{n}</Text>
              }
            </View>
            {labels?.[n - 1] ? (
              <Text style={[styles.label, active ? styles.labelActive : styles.labelPending]} numberOfLines={1}>
                {labels[n - 1]}
              </Text>
            ) : null}
            {n < total && <View style={[styles.line, done ? styles.lineDone : styles.linePending]} />}
          </View>
        );
      })}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    wrapper: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 0 },
    item:    { alignItems: 'center', flex: 1, position: 'relative' },

    circle: {
      width: 32, height: 32, borderRadius: 16,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2,
    },
    circleDone:    { backgroundColor: colors.primary, borderColor: colors.primary },
    circleActive:  { backgroundColor: colors.surface, borderColor: colors.primary },
    circlePending: { backgroundColor: colors.surface, borderColor: colors.border },

    check:       { color: colors.primaryFg, fontSize: 14, fontWeight: '700' },
    num:         { fontSize: 13, fontWeight: '700' },
    numActive:   { color: colors.primary },
    numPending:  { color: colors.textMuted },

    label:        { fontSize: 10, marginTop: 4, textAlign: 'center', maxWidth: 64 },
    labelActive:  { color: colors.primary, fontWeight: '600' },
    labelPending: { color: colors.textMuted },

    line: {
      position: 'absolute',
      top: 15, left: '50%',
      width: '100%', height: 2,
      zIndex: -1,
    },
    lineDone:    { backgroundColor: colors.primary },
    linePending: { backgroundColor: colors.border },
  });
}
