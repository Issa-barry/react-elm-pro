import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import type { AppNotification } from '../services/notifications-api.service';

function NotificationItem({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: (id: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: item.lu ? colors.surface : colors.primaryLight ?? colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}>
      {!item.lu && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
      <View style={styles.itemContent}>
        <Text style={[styles.titre, { color: colors.text }]}>{item.titre ?? 'Notification'}</Text>
        <Text style={[styles.message, { color: colors.textMuted }]}>{item.message}</Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {new Date(item.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, loading, error, load, markAllRead, markOneRead } =
    useNotifications();

  const handlePress = useCallback(
    (id: string) => {
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.lu) {
        markOneRead(id);
      }
    },
    [notifications, markOneRead]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* En-tête */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Alertes</Text>
        {unreadCount > 0
          ? (
            <TouchableOpacity onPress={markAllRead} style={styles.markAllInline}>
              <Text style={[styles.markAllText, { color: colors.primary }]}>Tout lire</Text>
            </TouchableOpacity>
          )
          : <View style={styles.headerSpacer} />
        }
      </View>

      {loading && notifications.length === 0
        ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )
        : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <NotificationItem item={item} onPress={handlePress} />}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={{ color: colors.textMuted ?? colors.text }}>
                  {error ?? 'Aucune notification'}
                </Text>
              </View>
            }
            contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : { paddingBottom: insets.bottom + 16 }}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn:        { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  headerSpacer:   { width: 64 },
  markAllInline:  { paddingHorizontal: 4, minWidth: 64, alignItems: 'flex-end' },
  markAllText:    { fontSize: 13, fontWeight: '600' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyContainer: { flex: 1 },
  item:           { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  dot:            { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 10, flexShrink: 0 },
  itemContent:    { flex: 1 },
  titre:          { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  message:        { fontSize: 13, marginBottom: 4 },
  date:           { fontSize: 11, opacity: 0.6 },
});
