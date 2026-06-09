import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '@/shared/constants/theme';
import { secureStorage } from '@/features/auth/services/secure-storage.service';

SplashScreen.preventAutoHideAsync();

const LOGO_PATH = 'M7.09219 2.87829C5.94766 3.67858 4.9127 4.62478 4.01426 5.68992C7.6857 5.34906 12.3501 5.90564 17.7655 8.61335C23.5484 11.5047 28.205 11.6025 31.4458 10.9773C31.1517 10.087 30.7815 9.23135 30.343 8.41791C26.6332 8.80919 21.8772 8.29127 16.3345 5.51998C12.8148 3.76014 9.71221 3.03521 7.09219 2.87829ZM28.1759 5.33332C25.2462 2.06 20.9887 0 16.25 0C14.8584 0 13.5081 0.177686 12.2209 0.511584C13.9643 0.987269 15.8163 1.68319 17.7655 2.65781C21.8236 4.68682 25.3271 5.34013 28.1759 5.33332ZM32.1387 14.1025C28.2235 14.8756 22.817 14.7168 16.3345 11.4755C10.274 8.44527 5.45035 8.48343 2.19712 9.20639C2.0292 9.24367 1.86523 9.28287 1.70522 9.32367C1.2793 10.25 0.939308 11.2241 0.695362 12.2356C0.955909 12.166 1.22514 12.0998 1.50293 12.0381C5.44966 11.161 11.0261 11.1991 17.7655 14.5689C23.8261 17.5991 28.6497 17.561 31.9029 16.838C32.0144 16.8133 32.1242 16.7877 32.2322 16.7613C32.2441 16.509 32.25 16.2552 32.25 16C32.25 15.358 32.2122 14.7248 32.1387 14.1025ZM31.7098 20.1378C27.8326 20.8157 22.5836 20.5555 16.3345 17.431C10.274 14.4008 5.45035 14.439 2.19712 15.1619C1.475 15.3223 0.825392 15.5178 0.252344 15.7241C0.250782 15.8158 0.25 15.9078 0.25 16C0.25 24.8366 7.41344 32 16.25 32C23.6557 32 29.8862 26.9687 31.7098 20.1378Z';

export default function Index() {
  // ── Animations ────────────────────────────────────────────────────────────
  const scale    = useRef(new Animated.Value(0.5)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const pulse    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Masquer le splash natif immédiatement → notre écran prend le relais
    SplashScreen.hideAsync();

    // 1. Logo : fade-in + spring scale
    Animated.parallel([
      Animated.timing(logoFade, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1, friction: 5, tension: 50, useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Texte : fade-in après le logo
      Animated.timing(textFade, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }).start();

      // 3. Pulse discret en boucle
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
        ])
      ).start();
    });

    // 4. Vérification du token après 2 s, puis redirect
    const timer = setTimeout(async () => {
      const token = await secureStorage.getToken();
      router.replace(token ? '/(tabs)' : '/(auth)/welcome');
    }, 2200);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>

      {/* Cercle décoratif en fond */}
      <Animated.View style={[styles.circle, { opacity: logoFade }]} />

      {/* Logo */}
      <Animated.View style={[
        styles.logoBox,
        { opacity: logoFade, transform: [{ scale: Animated.multiply(scale, pulse) }] },
      ]}>
        <Svg width={72} height={72} viewBox="0 0 32.25 32">
          <Path fillRule="evenodd" clipRule="evenodd" d={LOGO_PATH} fill="white" />
        </Svg>
      </Animated.View>

      {/* Nom + tagline */}
      <Animated.View style={[styles.textBlock, { opacity: textFade }]}>
        <Text style={styles.appName}>Eau la maman</Text>
        <Text style={styles.tagline}>Distribution d&apos;eau minérale</Text>
      </Animated.View>

      {/* Points de chargement animés */}
      <Animated.View style={[styles.dots, { opacity: textFade }]}>
        {[0, 1, 2].map(i => (
          <DotPulse key={i} delay={i * 200} />
        ))}
      </Animated.View>

    </View>
  );
}

function DotPulse({ delay }: { delay: number }) {
  const op = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(op, { toValue: 1,   duration: 400, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Animated.View style={[styles.dot, { opacity: op }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },

  // Cercle décoratif semi-transparent
  circle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  // Carte logo
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // Texte
  textBlock: {
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tagline: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    letterSpacing: 0.3,
  },

  // Dots
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});
