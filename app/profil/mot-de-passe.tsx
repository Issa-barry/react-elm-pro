import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { changePassword } from '@/features/auth/services/profile-api.service';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { Colors } from '@/shared/constants/theme';

export default function MotDePasseScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [current, setCurrent]       = useState('');
  const [next, setNext]             = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit() {
    setFieldErrors({});

    if (!current || !next || !confirm) {
      setFieldErrors({ current_password: current ? '' : 'Requis', password: next ? '' : 'Requis', password_confirmation: confirm ? '' : 'Requis' });
      return;
    }
    if (next !== confirm) {
      setFieldErrors({ password_confirmation: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (next.length < 8) {
      setFieldErrors({ password: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    setLoading(true);
    const result = await changePassword({ current_password: current, password: next, password_confirmation: confirm });
    setLoading(false);

    if (!result.ok) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        setFieldErrors(result.fieldErrors);
      } else {
        Alert.alert('Erreur', result.error ?? 'Une erreur est survenue.');
      }
      return;
    }

    Alert.alert('Succès', 'Votre mot de passe a été mis à jour.', [{ text: 'OK', onPress: () => router.back() }]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mot de passe</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 16 }}>

          <PasswordField
            label="Mot de passe actuel"
            value={current}
            onChangeText={setCurrent}
            show={showCurrent}
            onToggleShow={() => setShowCurrent(v => !v)}
            error={fieldErrors.current_password}
            styles={styles}
            colors={colors}
          />

          <PasswordField
            label="Nouveau mot de passe"
            value={next}
            onChangeText={setNext}
            show={showNext}
            onToggleShow={() => setShowNext(v => !v)}
            error={fieldErrors.password}
            styles={styles}
            colors={colors}
          />

          <PasswordField
            label="Confirmer le nouveau mot de passe"
            value={confirm}
            onChangeText={setConfirm}
            show={showConfirm}
            onToggleShow={() => setShowConfirm(v => !v)}
            error={fieldErrors.password_confirmation}
            styles={styles}
            colors={colors}
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            <Text style={styles.submitBtnText}>{loading ? 'Enregistrement…' : 'Mettre à jour'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function PasswordField({ label, value, onChangeText, show, onToggleShow, error, styles, colors }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  error?: string;
  styles: ReturnType<typeof makeStyles>;
  colors: typeof Colors;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, !!error && styles.inputRowError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity onPress={onToggleShow} style={styles.eyeBtn}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    root:            { flex: 1, backgroundColor: colors.background },
    header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    backBtn:         { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
    headerTitle:     { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
    headerSpacer:    { width: 36 },
    label:           { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
    inputRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, borderRadius: 10 },
    inputRowError:   { borderColor: colors.danger },
    input:           { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text },
    eyeBtn:          { paddingHorizontal: 14, paddingVertical: 12 },
    errorText:       { marginTop: 4, fontSize: 12, color: colors.danger },
    submitBtn:       { marginTop: 8, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
    submitBtnDisabled:{ opacity: 0.6 },
    submitBtnText:   { fontSize: 15, fontWeight: '700', color: '#fff' },
  });
}
