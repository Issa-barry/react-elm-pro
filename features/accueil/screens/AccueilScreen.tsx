import { ActivityIndicator, AppState, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { Colors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { IconSymbol } from '@/shared/components/ui/icon-symbol';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { getInitiales } from '@/shared/utils/initiales';
import { fetchNotifications } from '@/features/notifications/services/notifications-api.service';
import DashboardStats from '../components/DashboardStats';

const HEADER_HEIGHT = 140;

function formatPhone(phone: string): string {
  if (!phone) return '';
  const match = /^\+(\d{3})(\d{3})(\d{2})(\d{2})(\d{2})$/.exec(phone);
  if (match) return `+${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
  return phone;
}

export default function AccueilScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggle: toggleTheme, colors } = useTheme();
  const { user, loading: userLoading } = useCurrentUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const appStateRef = useRef(AppState.currentState);
  const scrollRef = useRef<ScrollView>(null);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const nom      = user ? `${user.prenom} ${user.nom}` : '';
  const phone    = user?.telephone ?? '';
  const initiales = getInitiales(user?.prenom, user?.nom);

  const pollNotifs = useCallback(async () => {
    try {
      const res = await fetchNotifications();
      setUnreadCount(res.unread_count);
    } catch { /* silencieux */ }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await pollNotifs();
    setRefreshing(false);
  }, [pollNotifs]);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      pollNotifs();
    }, [pollNotifs])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (appStateRef.current.match(/inactive|background/) && next === 'active') {
        pollNotifs();
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [pollNotifs]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {/* Gauche : avatar profil */}
        <TouchableOpacity
          style={[styles.headerBtn, styles.avatarBtn, { top: insets.top + 12, left: 16 }]}
          onPress={() => router.push('/profil')}
          accessibilityLabel="Ouvrir le profil">
          <Text style={styles.avatarInitiales}>{initiales}</Text>
        </TouchableOpacity>
        {/* Droite : notifications + thème */}
        <TouchableOpacity
          style={[styles.headerBtn, { top: insets.top + 12, right: 60 }]}
          onPress={() => router.push('/(tabs)/notifications')}
          accessibilityLabel="Notifications">
          <IconSymbol name="bell.fill" size={20} color={colors.headerFg} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerBtn, { top: insets.top + 12, right: 16 }]}
          onPress={toggleTheme}
          accessibilityLabel={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}>
          <IconSymbol name={isDark ? 'sun.max.fill' : 'moon.fill'} size={20} color={colors.headerFg} />
        </TouchableOpacity>
      </View>

      {/* Infos utilisateur */}
      <View style={styles.userSection}>
        {userLoading
          ? <ActivityIndicator color={colors.primary} />
          : <>
              <Text style={styles.name}>{nom}</Text>
              <Text style={styles.phone}>{formatPhone(phone)}</Text>
              <View style={styles.badgePro}>
                <Text style={styles.badgeProText}>Back-office</Text>
              </View>
            </>
        }
      </View>

      {/* Dashboard stats */}
      <View style={styles.statsSection}>
        <DashboardStats />
      </View>

    </ScrollView>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    scroll:     { backgroundColor: colors.background },
    header:     { height: HEADER_HEIGHT, backgroundColor: colors.headerBg },
    headerBtn: {
      position: 'absolute',
      width: 36, height: 36, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarBtn: {
      backgroundColor: '#ffffff',
      width: 44, height: 44, borderRadius: 22,
    },
    avatarInitiales: { fontSize: 16, fontWeight: '700', color: '#111111' },
    badge: {
      position: 'absolute', top: -2, right: -2,
      minWidth: 16, height: 16, borderRadius: 8,
      backgroundColor: colors.danger,
      alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 3,
    },
    badgeText:   { fontSize: 9, fontWeight: '700', color: '#fff' },
    userSection: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8, gap: 6 },
    name:        { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center' },
    phone:       { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
    badgePro: {
      backgroundColor: colors.primary + '22',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginTop: 4,
    },
    badgeProText: { fontSize: 12, fontWeight: '600', color: colors.primary },
    statsSection: { marginTop: 24 },
  });
}
