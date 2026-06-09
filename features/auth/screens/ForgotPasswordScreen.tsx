import { useMemo } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { AppLogo } from '@/shared/components/AppLogo';
import { CloseButton } from '@/shared/components/CloseButton';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { PhoneInput }    from '../components/PhoneInput';
import { OtpInput }      from '../components/OtpInput';
import { PasswordInput } from '../components/PasswordInput';

const STEP_CONFIG = {
  phone:        { title: 'Mot de passe oublié',   hint: 'Entrez votre numéro de téléphone pour recevoir un code par email.' },
  otp:          { title: 'Code de vérification',  hint: '' },
  new_password: { title: 'Nouveau mot de passe',  hint: 'Choisissez un mot de passe sécurisé.' },
  done:         { title: 'Mot de passe modifié',  hint: '' },
};

function btnLabel(step: string): string {
  if (step === 'phone') return 'Recevoir le code';
  if (step === 'otp')   return 'Vérifier le code';
  return 'Enregistrer le mot de passe';
}

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, set, setCountry, submit, autoLogin } = useForgotPassword();

  const config = STEP_CONFIG[state.step];

  const canSubmit = (() => {
    switch (state.step) {
      case 'phone':        return state.telephoneLocal.trim().length > 0;
      case 'otp':          return state.otp.trim().length === 5;
      case 'new_password': return state.password.length > 0 && state.passwordConfirmation.length > 0;
      default:             return false;
    }
  })();

  if (state.step === 'done') {
    return (
      <View style={[styles.flex, styles.center, { paddingTop: insets.top, paddingBottom: insets.bottom + 32 }]}>
        <AppLogo size={80} />
        <Text style={styles.doneTitle}>Mot de passe réinitialisé !</Text>
        <Text style={styles.doneText}>
          Votre mot de passe a été mis à jour avec succès.
        </Text>

        {state.autoLoginError ? (
          <View style={styles.autoLoginError}>
            <Text style={styles.autoLoginErrorText}>{state.autoLoginError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.doneBtn, state.autoLoginLoading && styles.btnDisabled]}
          onPress={autoLogin}
          disabled={state.autoLoginLoading}>
          {state.autoLoginLoading
            ? <ActivityIndicator color={colors.primaryFg} />
            : <Text style={styles.btnText}>Se connecter</Text>
          }
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <CloseButton />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Logo + titre */}
        <View style={styles.header}>
          <AppLogo size={80} />
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.hint}>{config.hint}</Text>
        </View>

        {/* Erreur globale */}
        {state.globalError ? (
          <View style={styles.globalError}>
            <Text style={styles.globalErrorText}>{state.globalError}</Text>
          </View>
        ) : null}

        {/* Étape : téléphone */}
        {state.step === 'phone' && (
          <PhoneInput
            codePays={state.codePays}
            prefix={state.prefix}
            telephoneLocal={state.telephoneLocal}
            onChangePhone={v => set('telephoneLocal', v)}
            onChangeCountry={setCountry}
            error={state.errors.telephoneLocal}
          />
        )}

        {/* Étape : OTP */}
        {state.step === 'otp' && (
          <View style={styles.otpWrapper}>
            <Text style={styles.otpEmailLabel}>Code envoyé à</Text>
            <Text style={styles.otpEmail}>{state.maskedEmail}</Text>
            <OtpInput
              value={state.otp}
              onChange={v => set('otp', v)}
              error={state.errors.otp}
            />
          </View>
        )}

        {/* Étape : nouveau mot de passe */}
        {state.step === 'new_password' && (
          <View style={styles.formGroup}>
            <PasswordInput
              label="Nouveau mot de passe"
              value={state.password}
              onChangeText={v => set('password', v)}
              placeholder="Min. 8 car., maj., chiffre, symbole"
              error={state.errors.password}
            />
            <PasswordInput
              label="Confirmer"
              value={state.passwordConfirmation}
              onChangeText={v => set('passwordConfirmation', v)}
              placeholder="Répéter le mot de passe"
              error={state.errors.passwordConfirmation}
            />
          </View>
        )}

        {/* Bouton principal */}
        <TouchableOpacity
          style={[styles.btn, (!canSubmit || state.loading) && styles.btnDisabled]}
          onPress={submit}
          disabled={!canSubmit || state.loading}>
          {state.loading
            ? <ActivityIndicator color={colors.primaryFg} />
            : <Text style={styles.btnText}>{btnLabel(state.step)}</Text>
          }
        </TouchableOpacity>

        {/* Lien retour connexion */}
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.back()}>
          <Text style={styles.backLinkText}>← Retour à la connexion</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    flex:    { flex: 1, backgroundColor: colors.background },
    center:  { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
    scroll:  { flex: 1 },
    content: { paddingHorizontal: 24, gap: 24 },

    header: { alignItems: 'center', gap: 10 },
    title:  { fontSize: 24, fontWeight: '700', color: colors.text },
    hint:   { fontSize: 14, color: colors.textMuted, lineHeight: 22, textAlign: 'center' },

    globalError:     { backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger, borderRadius: 10, padding: 12 },
    globalErrorText: { fontSize: 14, color: colors.danger, textAlign: 'center' },

    otpWrapper:    { alignItems: 'center', gap: 12 },
    otpEmailLabel: { fontSize: 13, color: colors.textMuted },
    otpEmail:      { fontSize: 16, fontWeight: '700', color: colors.text },
    formGroup:     { gap: 16 },

    btn:         { height: 52, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    doneBtn:     { height: 60, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', marginTop: 8 },
    btnDisabled: { opacity: 0.6 },
    btnText:     { color: colors.primaryFg, fontSize: 16, fontWeight: '700' },

    backLink:     { alignItems: 'center', paddingVertical: 4 },
    backLinkText: { color: colors.textMuted, fontSize: 14 },

    doneTitle: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
    doneText:  { fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },

    autoLoginError:     { backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger, borderRadius: 10, padding: 12, alignSelf: 'stretch' },
    autoLoginErrorText: { fontSize: 13, color: colors.danger, textAlign: 'center' },
  });
}
