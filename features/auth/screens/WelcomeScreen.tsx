import { useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { blue } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { HeroIllustration } from '@/features/auth/components/HeroIllustration';

const { height: SCREEN_H } = Dimensions.get('window');
const HERO_H = SCREEN_H * 0.58;

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.root}>

      {/* ── Hero illustration SVG ─────────────────────────────────────────── */}
      <View style={[styles.hero, { height: HERO_H }]}>

        {/* Illustration en arrière-plan */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <HeroIllustration />
        </View>

        {/* Logo badge en haut à gauche */}
        <View style={[styles.heroTop, { paddingTop: insets.top + 16 }]} />

        {/* Vague en bas du hero */}
        <View style={[styles.heroWave, { backgroundColor: colors.surface }]} />
      </View>

      {/* ── Carte ─────────────────────────────────────────────────────────── */}
      <View style={[styles.card, { paddingBottom: insets.bottom + 24 }]}>

        {/* Titre */}
        <Text style={styles.title}>
          <Text style={styles.titlePrimary}>EAU </Text>
          <Text style={styles.titleDark}>la maman</Text>
        </Text>

        {/* Sous-titres */}
        <View style={styles.subtitles}>
          <View style={styles.subtitleRow}>
            <View style={styles.bullet} />
            <Text style={styles.subtitleText}>
              Proposez votre véhicule et générez des revenus
            </Text>
          </View>
          <View style={styles.subtitleRow}>
            <View style={styles.bullet} />
            <Text style={styles.subtitleText}>
              Rejoignez-nous en tant que livreur et travaillez à votre rythme
            </Text>
          </View>
        </View>

        {/* Boutons */}
        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.btnPrimaryText}>Se connecter</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnOutline, pressed && styles.btnOutlinePressed]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.btnOutlineText}>S'inscrire</Text>
          </Pressable>
        </View>

      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.surface,
    },

    // ── Hero ──────────────────────────────────────────────────────────────
    hero: {
      width: '100%',
      backgroundColor: blue[800],
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    heroTop: {
      paddingHorizontal: 24,
      alignItems: 'flex-start',
    },
    heroWave: {
      height: 36,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
    },

    // ── Carte ─────────────────────────────────────────────────────────────
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingHorizontal: 28,
      paddingTop: 8,
      gap: 24,
    },

    // Titre
    title: {
      fontSize: 36,
      fontWeight: '800',
      letterSpacing: -0.5,
      lineHeight: 42,
    },
    titlePrimary: {
      color: colors.primary,
    },
    titleDark: {
      color: colors.text,
    },

    // Sous-titres
    subtitles: {
      gap: 12,
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 7,
      flexShrink: 0,
    },
    subtitleText: {
      flex: 1,
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },

    // Boutons
    buttons: {
      gap: 12,
      marginTop: 4,
    },
    btnPrimary: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    btnPrimaryPressed: {
      backgroundColor: colors.primaryDark,
      opacity: 0.9,
    },
    btnPrimaryText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    btnOutline: {
      borderRadius: 14,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
    },
    btnOutlinePressed: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    btnOutlineText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
  });
}
