import * as Haptics from 'expo-haptics';
import { memo, useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/shared/contexts/ThemeContext';

// ── Public API ────────────────────────────────────────────────────────────────

export interface NumericKeyboardProps {
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  /** Show a decimal point key (adds a 5th row with a full-width confirm). */
  allowDecimal?: boolean;
  /** Label shown on the confirm key (default "OK"). */
  confirmLabel?: string;
  /** Greys out the confirm key without preventing interaction. */
  confirmDisabled?: boolean;
  /** Extra bottom padding (pass insets.bottom from the parent). */
  safeAreaBottom?: number;
}

/**
 * Approximate height of the keyboard body (without safeAreaBottom).
 * Use this to adjust ScrollView contentContainerStyle.paddingBottom.
 */
export const KEYBOARD_HEIGHT = 256;

const MAX_DIGITS = 8;

// ── KeyButton ─────────────────────────────────────────────────────────────────

type KeyVariant = 'digit' | 'action' | 'confirm';

interface KeyButtonProps {
  label: string;
  onPress: () => void;
  variant?: KeyVariant;
  disabled?: boolean;
}

const KeyButton = memo(function KeyButton({
  label,
  onPress,
  variant = 'digit',
  disabled = false,
}: KeyButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 5,
    }).start();
  }, [scale]);

  const bgColor =
    variant === 'confirm'
      ? disabled
        ? colors.border
        : colors.primary
      : variant === 'action'
        ? colors.surfaceAlt
        : colors.surface;

  const textColor =
    variant === 'confirm'
      ? disabled
        ? colors.textMuted
        : '#fff'
      : variant === 'action'
        ? colors.textMuted
        : colors.text;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={styles.keyWrap}
      android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View
        style={[styles.key, { backgroundColor: bgColor, transform: [{ scale }] }]}
      >
        <Text
          style={[
            styles.keyLabel,
            { color: textColor },
            variant === 'confirm' && styles.keyLabelConfirm,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

// ── NumericKeyboard ───────────────────────────────────────────────────────────

export const NumericKeyboard = memo(function NumericKeyboard({
  value,
  onChange,
  onConfirm,
  allowDecimal = false,
  confirmLabel = 'OK',
  confirmDisabled = false,
  safeAreaBottom = 0,
}: NumericKeyboardProps) {
  const { colors } = useTheme();

  const pressDigit = useCallback(
    (d: string) => {
      if (value.length >= MAX_DIGITS) return;
      // Avoid leading zeros (except before a decimal point)
      const next =
        value === '' || value === '0' ? d : value + d;
      onChange(next);
    },
    [value, onChange],
  );

  const pressDelete = useCallback(() => {
    onChange(value.slice(0, -1));
  }, [value, onChange]);

  const pressDecimal = useCallback(() => {
    if (!allowDecimal || value.includes('.')) return;
    onChange(value === '' ? '0.' : value + '.');
  }, [value, onChange, allowDecimal]);

  return (
    <View
      style={[
        styles.keyboard,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: 6 + safeAreaBottom,
        },
      ]}
    >
      {/* Rows 1–3: digits 1–9 */}
      {(['123', '456', '789'] as const).map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.split('').map(d => (
            <KeyButton key={d} label={d} onPress={() => pressDigit(d)} />
          ))}
        </View>
      ))}

      {/* Row 4 — layout differs with/without decimal */}
      {allowDecimal ? (
        <>
          <View style={styles.row}>
            <KeyButton label="." onPress={pressDecimal} variant="action" />
            <KeyButton label="0" onPress={() => pressDigit('0')} />
            <KeyButton label="⌫" onPress={pressDelete} variant="action" />
          </View>
          {/* Full-width confirm row */}
          <View style={styles.row}>
            <KeyButton
              label={confirmLabel}
              onPress={onConfirm}
              variant="confirm"
              disabled={confirmDisabled}
            />
          </View>
        </>
      ) : (
        <View style={styles.row}>
          <KeyButton label="⌫" onPress={pressDelete} variant="action" />
          <KeyButton label="0" onPress={() => pressDigit('0')} />
          <KeyButton
            label={confirmLabel}
            onPress={onConfirm}
            variant="confirm"
            disabled={confirmDisabled}
          />
        </View>
      )}
    </View>
  );
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  keyboard: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  keyWrap: {
    flex: 1,
  },
  key: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  keyLabel: {
    fontSize: 22,
    fontWeight: '500',
    includeFontPadding: false,
  },
  keyLabelConfirm: {
    fontSize: 17,
    fontWeight: '700',
  },
});
