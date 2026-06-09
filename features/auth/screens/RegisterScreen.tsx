import { useMemo, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Linking, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { useRegister, TOTAL_STEPS } from '../hooks/useRegister';
import { PhoneInput }    from '../components/PhoneInput';
import { AuthInput }     from '../components/AuthInput';
import { PasswordInput } from '../components/PasswordInput';

const LOGO_PATH = 'M7.09219 2.87829C5.94766 3.67858 4.9127 4.62478 4.01426 5.68992C7.6857 5.34906 12.3501 5.90564 17.7655 8.61335C23.5484 11.5047 28.205 11.6025 31.4458 10.9773C31.1517 10.087 30.7815 9.23135 30.343 8.41791C26.6332 8.80919 21.8772 8.29127 16.3345 5.51998C12.8148 3.76014 9.71221 3.03521 7.09219 2.87829ZM28.1759 5.33332C25.2462 2.06 20.9887 0 16.25 0C14.8584 0 13.5081 0.177686 12.2209 0.511584C13.9643 0.987269 15.8163 1.68319 17.7655 2.65781C21.8236 4.68682 25.3271 5.34013 28.1759 5.33332ZM32.1387 14.1025C28.2235 14.8756 22.817 14.7168 16.3345 11.4755C10.274 8.44527 5.45035 8.48343 2.19712 9.20639C2.0292 9.24367 1.86523 9.28287 1.70522 9.32367C1.2793 10.25 0.939308 11.2241 0.695362 12.2356C0.955909 12.166 1.22514 12.0998 1.50293 12.0381C5.44966 11.161 11.0261 11.1991 17.7655 14.5689C23.8261 17.5991 28.6497 17.561 31.9029 16.838C32.0144 16.8133 32.1242 16.7877 32.2322 16.7613C32.2441 16.509 32.25 16.2552 32.25 16C32.25 15.358 32.2122 14.7248 32.1387 14.1025ZM31.7098 20.1378C27.8326 20.8157 22.5836 20.5555 16.3345 17.431C10.274 14.4008 5.45035 14.439 2.19712 15.1619C1.475 15.3223 0.825392 15.5178 0.252344 15.7241C0.250782 15.8158 0.25 15.9078 0.25 16C0.25 24.8366 7.41344 32 16.25 32C23.6557 32 29.8862 26.9687 31.7098 20.1378Z';

const STEP_TITLES = [
  'Créer votre compte',
  'Vos informations',
  'Votre adresse email',
  'Votre mot de passe',
];

const MAIL_APPS = [
  { label: 'Gmail',             url: 'googlegmail://', icon: 'gmail',              lib: 'mci', color: '#EA4335' },
  { label: 'Microsoft Outlook', url: 'ms-outlook://',  icon: 'microsoft-outlook',  lib: 'mci', color: '#0078D4' },
  { label: 'Mail',              url: 'mailto:',        icon: 'mail',               lib: 'ion', color: '#007AFF' },
] as const;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { state, set, setCountry, next, back } = useRegister();
  const [mailChooser, setMailChooser] = useState(false);

  const openMailApp = async (url: string) => {
    setMailChooser(false);
    try { await Linking.openURL(url); } catch { /* app non installée */ }
  };

  const handleBack = () => state.step > 1 ? back() : router.back();

  const canContinue = (() => {
    switch (state.step) {
      case 1: return state.telephoneLocal.trim().length > 0;
      case 2: return state.prenom.trim().length >= 2 && state.nom.trim().length >= 2;
      case 3: return state.email.trim().length > 0;
      case 4: return state.password.length > 0 && state.passwordConfirmation.length > 0;
      default: return false;
    }
  })();

  // ── État final : écran de confirmation style Bolt ─────────────────────────
  if (state.done) {
    return (
      <View style={[styles.done, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

        {/* Logo en haut à gauche */}
        <View style={styles.doneLogoWrap}>
          <Svg width={32} height={32} viewBox="0 0 32.25 32">
            <Path fillRule="evenodd" clipRule="evenodd" d={LOGO_PATH} fill="white" />
          </Svg>
        </View>

        {/* Espace */}
        <View style={{ flex: 1 }} />

        {/* Titre + description */}
        <View style={styles.doneContent}>
          <Text style={styles.doneTitle}>{'CONFIRMEZ VOTRE\nADRESSE E-MAIL'}</Text>
          <Text style={styles.doneDesc}>
            {'Cliquez sur le lien envoyé à\n'}
            <Text style={styles.doneEmailHighlight}>{state.registeredEmail}</Text>
          </Text>
          <Text style={styles.doneHint}>
            Si vous ne le trouvez pas, veuillez consulter votre dossier spam.
          </Text>
        </View>

        {/* Espace */}
        <View style={{ flex: 0.8 }} />

        {/* Boutons */}
        <View style={styles.doneActions}>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => setMailChooser(true)}
            accessibilityLabel="Accéder à la boîte mail">
            <Text style={styles.doneBtnText}>Accéder à la boîte mail</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneResend}
            onPress={() => router.replace('/(auth)/login')}
            accessibilityLabel="Retour à la connexion">
            <Text style={styles.doneResendText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>

        {/* Sélecteur de boîte mail (style iOS action sheet) */}
        <Modal visible={mailChooser} transparent animationType="fade">
          <Pressable style={styles.mailOverlay} onPress={() => setMailChooser(false)}>
            <View style={[styles.mailSheet, { paddingBottom: insets.bottom + 8 }]}>

              {/* Options */}
              <View style={styles.mailOptions}>
                {MAIL_APPS.map((app, i) => (
                  <View key={app.url}>
                    {i > 0 && <View style={styles.mailSep} />}
                    <TouchableOpacity
                      style={styles.mailOption}
                      onPress={() => openMailApp(app.url)}>
                      {app.lib === 'mci'
                        ? <MaterialCommunityIcons name={app.icon as never} size={26} color={app.color} />
                        : <Ionicons name={app.icon as never} size={26} color={app.color} />
                      }
                      <Text style={styles.mailOptionText}>{app.label}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Annuler */}
              <TouchableOpacity
                style={styles.mailCancel}
                onPress={() => setMailChooser(false)}>
                <Text style={styles.mailCancelText}>Annuler</Text>
              </TouchableOpacity>

            </View>
          </Pressable>
        </Modal>

      </View>
    );
  }

  // ── Formulaire multi-étapes ────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <Pressable
        onPress={handleBack}
        android_ripple={null}
        accessibilityLabel="Retour"
        style={[styles.backBtn, { top: insets.top + 10 }]}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </Pressable>

      <View style={[styles.headerRow, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>{STEP_TITLES[state.step - 1]}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { flexGrow: 1, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <View style={styles.formCenter}>

          {state.globalError ? (
            <View style={styles.globalError}>
              <Text style={styles.globalErrorText}>{state.globalError}</Text>
            </View>
          ) : null}

          {/* ── Étape 1 : Téléphone ─────────────────────────────────────── */}
          {state.step === 1 && (
            <PhoneInput
              codePays={state.codePays}
              prefix={state.prefix}
              telephoneLocal={state.telephoneLocal}
              onChangePhone={v => set('telephoneLocal', v)}
              onChangeCountry={setCountry}
              error={state.errors.telephoneLocal}
            />
          )}

          {/* ── Étape 2 : Identité ──────────────────────────────────────── */}
          {state.step === 2 && (
            <View style={styles.stepCard}>
              {state.prefilled && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    ✓ Informations pré-remplies depuis nos dossiers.
                  </Text>
                </View>
              )}
              <AuthInput
                label="Prénom"
                value={state.prenom}
                onChangeText={v => set('prenom', v)}
                placeholder="Ex : Moussa"
                autoCapitalize="words"
                locked={state.prefilled}
                error={state.errors.prenom}
              />
              <AuthInput
                label="Nom"
                value={state.nom}
                onChangeText={v => set('nom', v)}
                placeholder="Ex : SIDIBÉ"
                autoCapitalize="characters"
                locked={state.prefilled}
                error={state.errors.nom}
              />
            </View>
          )}

          {/* ── Étape 3 : Email ─────────────────────────────────────────── */}
          {state.step === 3 && (
            <AuthInput
              label="Adresse email"
              value={state.email}
              onChangeText={v => set('email', v)}
              placeholder="exemple@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={state.errors.email}
            />
          )}

          {/* ── Étape 4 : Mot de passe ──────────────────────────────────── */}
          {state.step === 4 && (
            <View style={styles.stepCard}>
              <View style={styles.recapCard}>
                <Text style={styles.recapTitle}>Récapitulatif</Text>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>Téléphone</Text>
                  <Text style={styles.recapValue}>{state.telephone}</Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>Prénom</Text>
                  <Text style={styles.recapValue}>{state.prenom}</Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>Nom</Text>
                  <Text style={styles.recapValue}>{state.nom.toUpperCase()}</Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>Email</Text>
                  <Text style={styles.recapValue}>{state.email}</Text>
                </View>
              </View>
              <PasswordInput
                label="Mot de passe"
                value={state.password}
                onChangeText={v => set('password', v)}
                placeholder="Min. 8 car., maj., chiffre, symbole"
                error={state.errors.password}
              />
              <PasswordInput
                label="Confirmer le mot de passe"
                value={state.passwordConfirmation}
                onChangeText={v => set('passwordConfirmation', v)}
                placeholder="Répéter le mot de passe"
                error={state.errors.passwordConfirmation}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnNext, (!canContinue || state.loading) && styles.btnDisabled]}
            onPress={next}
            disabled={!canContinue || state.loading}
            accessibilityLabel={state.step === TOTAL_STEPS ? 'Créer mon compte' : 'Étape suivante'}>
            {state.loading
              ? <ActivityIndicator color={colors.primaryFg} />
              : <Text style={styles.btnNextText}>
                  {state.step === TOTAL_STEPS ? 'Créer mon compte' : 'Continuer →'}
                </Text>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}> Se connecter</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    flex:       { flex: 1, backgroundColor: colors.background },
    scroll:     { flex: 1 },
    content:    { paddingHorizontal: 24 },
    formCenter: { flex: 1, justifyContent: 'center', gap: 24 },

    backBtn: {
      position: 'absolute',
      left: 20,
      zIndex: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },

    headerRow: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 10,
    },
    title: { fontSize: 20, fontWeight: '700', color: colors.text },

    globalError:     { backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger, borderRadius: 10, padding: 12 },
    globalErrorText: { fontSize: 14, color: colors.danger, textAlign: 'center' },

    stepCard: { gap: 16 },

    infoBox:  { backgroundColor: colors.infoBg, borderWidth: 1, borderColor: colors.primaryLight, borderRadius: 10, padding: 10 },
    infoText: { fontSize: 13, color: colors.primary },

    recapCard: {
      backgroundColor: colors.surface, borderRadius: 14,
      borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8,
    },
    recapTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 2 },
    recapRow:   { flexDirection: 'row', justifyContent: 'space-between' },
    recapLabel: { fontSize: 13, color: colors.textMuted },
    recapValue: { fontSize: 13, fontWeight: '600', color: colors.text },

    btnNext:     { height: 52, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    btnDisabled: { opacity: 0.4 },
    btnNextText: { color: colors.primaryFg, fontSize: 16, fontWeight: '700' },

    footer:     { flexDirection: 'row', justifyContent: 'center', paddingTop: 4 },
    footerText: { fontSize: 14, color: colors.textMuted },
    footerLink: { fontSize: 14, color: colors.primary, fontWeight: '700' },

    // ── Écran de confirmation (style Bolt, fond bleu primary — toujours bleu) ─
    done: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingHorizontal: 28,
    },
    doneLogoWrap: { paddingTop: 20 },
    doneContent:  { gap: 18 },
    doneTitle: {
      fontSize: 34, fontWeight: '800', color: '#ffffff',
      letterSpacing: -0.5, lineHeight: 40, textTransform: 'uppercase',
    },
    doneDesc:           { fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 22 },
    doneEmailHighlight: { color: '#ffffff', fontWeight: '600' },
    doneHint:           { fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 20 },
    doneActions: { gap: 4, paddingBottom: 12 },
    doneBtn: {
      height: 54, borderRadius: 14,
      backgroundColor: '#ffffff',
      alignItems: 'center', justifyContent: 'center',
    },
    doneBtnText:    { fontSize: 16, fontWeight: '700', color: colors.primary },
    doneResend:     { alignItems: 'center', paddingVertical: 14 },
    doneResendText: { fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },

    // ── Mail chooser (style iOS action sheet) ────────────────────────────────
    mailOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
    },
    mailSheet:   { paddingHorizontal: 12, gap: 10 },
    mailOptions: { backgroundColor: colors.surface, borderRadius: 14, overflow: 'hidden' },
    mailSep:     { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: 16 },
    mailOption:  { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    mailOptionText: { fontSize: 17, color: colors.primary },
    mailCancel:     { backgroundColor: colors.surface, borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center' },
    mailCancelText: { fontSize: 17, fontWeight: '700', color: colors.primary },
  });
}
