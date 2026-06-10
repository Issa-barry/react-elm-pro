import { ActivityIndicator, AppState, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { router, useFocusEffect } from 'expo-router';

import { Colors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { IconSymbol } from '@/shared/components/ui/icon-symbol';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { getInitiales } from '@/shared/utils/initiales';
import { COUNTRIES } from '@/features/auth/types/auth.types';
import { fetchNotifications } from '@/features/notifications/services/notifications-api.service';
import { useQrPayload } from '../hooks/useQrPayload';
import { useStats } from '../hooks/useStats';
import StatsCarousel from '../components/StatsCarousel';
import BusinessGrid from '../components/BusinessGrid';

const QR_SIZE            = 90;
const QR_ZOOM_SIZE       = 240;
const QR_WRAPPER_PADDING = 12;
const QR_OVERLAP         = QR_SIZE / 2;
const HEADER_HEIGHT      = 140;
const QR_CARD_HEIGHT     = QR_SIZE + QR_WRAPPER_PADDING * 2;
const QR_BELOW_HEADER    = QR_CARD_HEIGHT - QR_OVERLAP;

function formatPhone(phone: string): string {
  if (!phone) return '';
  const country = COUNTRIES.find(c => phone.startsWith(c.prefix));
  if (!country) return phone;
  const local = phone.slice(country.prefix.length);
  if (!local) return phone;
  // Premier groupe de 3 si nombre de chiffres impair, sinon 2
  const firstSize = local.length % 2 === 1 ? 3 : 2;
  const parts: string[] = [local.slice(0, firstSize)];
  for (let i = firstSize; i < local.length; i += 2) {
    parts.push(local.slice(i, i + 2));
  }
  return `${country.prefix} ${parts.join(' ')}`;
}

export default function AccueilScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggle: toggleTheme, colors } = useTheme();
  const { user, loading: userLoading } = useCurrentUser();
  const [qrZoomed, setQrZoomed]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing]   = useState(false);
  const appStateRef = useRef(AppState.currentState);
  const scrollRef   = useRef<ScrollView>(null);
  const { qrPayload, site, loading: qrLoading, load: loadQr } = useQrPayload();
  const { stats, loading: statsLoading, load: loadStats } = useStats();

  const styles  = useMemo(() => makeStyles(colors), [colors]);
  const nom      = user ? `${user.prenom} ${user.nom}` : '';
  const phone    = user?.telephone ?? '';
  const qrData   = qrPayload ?? user?.id ?? 'elm-pro';
  const initiales = getInitiales(user?.prenom, user?.nom);

  useEffect(() => { loadQr(); loadStats(); }, [loadQr, loadStats]);

  const pollNotifs = useCallback(async () => {
    try {
      const res = await fetchNotifications();
      setUnreadCount(res.unread_count);
    } catch { /* silencieux */ }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadQr(), loadStats(), pollNotifs()]);
    setRefreshing(false);
  }, [loadQr, pollNotifs]);

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
    <>
    <StatusBar style="light" backgroundColor={colors.headerBg} />
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
        <TouchableOpacity
          style={[styles.headerBtn, styles.avatarBtn, { top: insets.top + 12, left: 16 }]}
          onPress={() => router.push('/profil')}
          accessibilityLabel="Ouvrir le profil">
          <Text style={styles.avatarInitiales}>{initiales}</Text>
        </TouchableOpacity>
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

      {/* QR code flottant */}
      <View style={styles.qrAnchor}>
        <TouchableOpacity
          style={styles.qrWrapper}
          onPress={() => !userLoading && setQrZoomed(true)}
          activeOpacity={0.8}
          accessibilityLabel="Agrandir le QR code">
          {(userLoading || qrLoading)
            ? <View style={styles.qrPlaceholder}><ActivityIndicator color={colors.primary} /></View>
            : <QRCode value={qrData} size={QR_SIZE} color="#000000" backgroundColor="#ffffff" />
          }
        </TouchableOpacity>
      </View>

      {/* Modal zoom QR */}
      <Modal
        visible={qrZoomed}
        transparent
        animationType="fade"
        onRequestClose={() => setQrZoomed(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setQrZoomed(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {!qrLoading && <QRCode value={qrData} size={QR_ZOOM_SIZE} color="#000000" backgroundColor="#ffffff" />}
            <Text style={styles.modalHint}>Appuyez en dehors pour fermer</Text>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Infos utilisateur */}
      <View style={[styles.userSection, { paddingTop: QR_BELOW_HEADER + 24 }]}>
        {userLoading
          ? <ActivityIndicator color={colors.primary} />
          : <>
              <Text style={styles.name}>{nom}</Text>
              <Text style={styles.phone}>{formatPhone(phone)}</Text>
              {!qrLoading && (
                <View style={styles.siteBadge}>
                  <Text style={styles.siteBadgeText}>
                    {site ? site.nom : 'Back-office'}
                  </Text>
                </View>
              )}
            </>
        }
      </View>

      {/* Cartes statistiques */}
      <View style={styles.carouselSection}>
        <StatsCarousel stats={stats} loading={statsLoading} />
      </View>

      {/* Grille des objets métier */}
      <View style={styles.gridSection}>
        <BusinessGrid />
      </View>

    </ScrollView>
    </>
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
    badgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
    qrAnchor: {
      position: 'absolute',
      top: HEADER_HEIGHT - QR_OVERLAP,
      left: 0, right: 0,
      alignItems: 'center',
    },
    qrWrapper: {
      backgroundColor: colors.surface,
      padding: QR_WRAPPER_PADDING,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.headerBg,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    qrPlaceholder:  { width: QR_SIZE, height: QR_SIZE, alignItems: 'center', justifyContent: 'center' },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCard: {
      backgroundColor: colors.surface,
      padding: 28,
      borderRadius: 20,
      alignItems: 'center',
      gap: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
    modalHint:  { fontSize: 12, color: colors.textMuted },
    userSection:    { alignItems: 'center', paddingHorizontal: 24, gap: 6 },
    carouselSection: { marginTop: 28 },
    gridSection:     { marginTop: 28 },
    name:        { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center' },
    phone:       { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
    siteBadge: {
      backgroundColor: colors.primary + '22',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginTop: 4,
    },
    siteBadgeText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  });
}
