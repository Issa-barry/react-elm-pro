import { useMemo } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { AppLogo } from '@/shared/components/AppLogo';
import { useLogin } from '../hooks/useLogin';
import { PhoneInput } from '../components/PhoneInput';
import { PasswordInput } from '../components/PasswordInput';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, set, setCountry, submit } = useLogin();
  const canSubmit = state.telephoneLocal.trim().length > 0 && state.password.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Logo + titre */}
        <View style={styles.header}>
          <AppLogo size={80} />
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Eau la maman PRO</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <PhoneInput
            codePays={state.codePays}
            prefix={state.prefix}
            telephoneLocal={state.telephoneLocal}
            onChangePhone={v => set('telephoneLocal', v)}
            onChangeCountry={setCountry}
            error={state.errors.telephoneLocal}
          />

          <PasswordInput
            label="Mot de passe"
            value={state.password}
            onChangeText={v => set('password', v)}
            placeholder="••••••••"
            error={state.errors.password}
          />

          {state.globalError ? (
            <View style={[
              styles.errorBox,
              state.errorCode === 'account_blocked' && styles.errorBoxBlocked,
              state.errorCode === 'not_staff'        && styles.errorBoxBlocked,
              state.errorCode === 'email_not_verified' && styles.errorBoxWarning,
            ]}>
              <Text style={[
                styles.errorText,
                state.errorCode === 'email_not_verified' && styles.errorTextWarning,
              ]}>
                {state.globalError}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.btn, (!canSubmit || state.loading) && styles.btnDisabled]}
            onPress={submit}
            disabled={!canSubmit || state.loading}
            accessibilityLabel="Se connecter">
            {state.loading
              ? <ActivityIndicator color={colors.primaryFg} />
              : <Text style={styles.btnText}>Se connecter</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.link}
            accessibilityLabel="Mot de passe oublié">
            <Text style={styles.linkText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    flex:    { flex: 1, backgroundColor: colors.background },
    scroll:  { flex: 1 },
    content: { paddingHorizontal: 24, gap: 32 },

    header:   { alignItems: 'center', gap: 10 },
    title:    { fontSize: 26, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 15, color: colors.textMuted },

    form: { gap: 16 },

    errorBox: {
      backgroundColor: colors.dangerBg,
      borderWidth: 1, borderColor: colors.danger,
      borderRadius: 10, padding: 12,
    },
    errorBoxBlocked: {
      backgroundColor: colors.dangerBg,
      borderColor: colors.danger,
    },
    errorBoxWarning: {
      backgroundColor: colors.warningBg,
      borderColor: colors.warning,
    },
    errorText:        { fontSize: 14, color: colors.danger, textAlign: 'center' },
    errorTextWarning: { color: colors.warning },

    btn: {
      height: 52, borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
      marginTop: 4,
    },
    btnDisabled: { opacity: 0.6 },
    btnText:     { color: colors.primaryFg, fontSize: 16, fontWeight: '700' },

    link:     { alignItems: 'center', paddingVertical: 4 },
    linkText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  });
}
