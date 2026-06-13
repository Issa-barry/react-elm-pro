import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { useTransferts } from '../hooks/useTransferts';

interface ActionCard {
  icon: string;
  title: string;
  subtitle: string;
  route: string;
  count?: number | null;
  color: string;
}

export default function LogistiqueHomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { transferts: enAttente, load } = useTransferts({ statut: 'transit' });

  useEffect(() => { load(); }, [load]);

  const cards: ActionCard[] = [
    {
      icon: '📦',
      title: 'Réceptions en attente',
      subtitle: 'Transferts à réceptionner',
      route: '/logistique/receptions',
      count: enAttente.length || null,
      color: colors.warning,
    },
    {
      icon: '🚚',
      title: 'Toutes les livraisons',
      subtitle: 'Historique complet',
      route: '/logistique/transferts',
      count: null,
      color: colors.primary,
    },
    {
      icon: '💰',
      title: 'Commissions',
      subtitle: 'Suivi des paiements',
      route: '/logistique/commissions',
      count: null,
      color: colors.success,
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Logistique</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Gestion des transferts</Text>
          </View>
          <TouchableOpacity
            style={[styles.newBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/logistique/create')}
            activeOpacity={0.8}
          >
            <Text style={styles.newBtnText}>+ Nouveau</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {cards.map(card => (
          <TouchableOpacity
            key={card.route}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(card.route as never)}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: card.color + '1A' }]}>
              <Text style={styles.cardIconEmoji}>{card.icon}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
              <Text style={[styles.cardSub, { color: colors.textMuted }]}>{card.subtitle}</Text>
            </View>
            {card.count != null && card.count > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                <Text style={styles.badgeText}>{card.count}</Text>
              </View>
            )}
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    root:      { flex: 1, backgroundColor: colors.background },
    header:    { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title:     { fontSize: 24, fontWeight: '700' },
    subtitle:  { fontSize: 14, marginTop: 2 },
    newBtn:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    newBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    content: { padding: 16, gap: 12 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 16,
    },
    cardIcon:      { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    cardIconEmoji: { fontSize: 24 },
    cardBody:  { flex: 1, gap: 3 },
    cardTitle: { fontSize: 16, fontWeight: '700' },
    cardSub:   { fontSize: 13 },
    badge:     { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, minWidth: 26, alignItems: 'center' },
    badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
    chevron:   { fontSize: 22, fontWeight: '300' },
  });
}
