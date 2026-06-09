import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';

/**
 * Écran affiché quand l'utilisateur revient dans l'app via le deep link
 * mobile://email-verified (après clic sur le lien de validation email).
 */
export default function EmailVerifiedScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}>
      <View style={styles.card}>

        {/* Icône succès */}
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>✅</Text>
        </View>

        <Text style={styles.title}>Email validé !</Text>

        <Text style={styles.desc}>
          Votre compte est maintenant actif.{'\n'}
          Vous pouvez vous connecter.
        </Text>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.replace('/(auth)/login')}
          accessibilityLabel="Se connecter">
          <Text style={styles.btnText}>Se connecter</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 36,
      alignItems: 'center',
      gap: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconWrap: { marginBottom: 4 },
    icon:     { fontSize: 52 },
    title:    { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center' },
    desc:     { fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
    divider:  { width: 40, height: 3, backgroundColor: colors.successBg, borderRadius: 2, marginVertical: 4 },
    btn: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  });
}
