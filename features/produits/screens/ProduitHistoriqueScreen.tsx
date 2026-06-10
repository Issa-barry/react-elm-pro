import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { fetchHistoriqueStock } from '../services/produits-api.service';
import type { AuditEntry, MouvementStock } from '../types/produit.types';

type Tab = 'stock' | 'global';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
}

// ─── Stock tab ────────────────────────────────────────────────────────────────

function MouvementItem({ item }: { item: MouvementStock }) {
  const { colors } = useTheme();
  const isInitial = item.is_initial === true;
  const isEntree = item.type === 'entree';

  const color = isInitial ? colors.primary : isEntree ? colors.success : colors.danger;
  const bg = isInitial ? colors.infoBg : isEntree ? colors.successBg : colors.dangerBg;
  const iconName = isInitial ? 'cube-outline' : isEntree ? 'arrow-up' : 'arrow-down';
  const qtyPrefix = isInitial ? '' : isEntree ? '+' : '-';

  return (
    <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.typeBadge, { backgroundColor: bg }]}>
        <Ionicons name={iconName as any} size={16} color={color} />
      </View>
      <View style={styles.itemBody}>
        <View style={styles.itemTop}>
          <Text style={[styles.itemQty, { color }]}>
            {qtyPrefix}{item.quantite}
          </Text>
          <Text style={[styles.itemStock, { color: colors.textMuted }]}>
            {item.stock_avant} → {item.stock_apres}
          </Text>
        </View>
        {item.notes ? (
          <Text style={[styles.itemNotes, { color: colors.textMuted }]} numberOfLines={2}>
            {item.notes}
          </Text>
        ) : null}
        <View style={styles.itemMeta}>
          <Text style={[styles.itemDate, { color: colors.textLight }]}>
            {formatDate(item.created_at)}
          </Text>
          {item.createur ? (
            <Text style={[styles.itemCreateur, { color: colors.textMuted }]}>
              {item.createur}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ─── Global tab ───────────────────────────────────────────────────────────────

function AuditItem({ item }: { item: AuditEntry }) {
  const { colors } = useTheme();

  const styleMap: Record<string, { color: string; bg: string; icon: string }> = {
    CREATED:        { color: colors.success, bg: colors.successBg, icon: 'add-circle-outline' },
    UPDATED:        { color: colors.primary, bg: colors.infoBg,    icon: 'pencil-outline' },
    DELETED:        { color: colors.danger,  bg: colors.dangerBg,  icon: 'trash-outline' },
    STOCK_ADJUSTED: { color: colors.warning, bg: colors.warningBg, icon: 'swap-vertical-outline' },
  };
  const s = styleMap[item.event_code] ?? {
    color: colors.textMuted,
    bg: colors.surfaceAlt,
    icon: 'information-circle-outline',
  };

  // Champs modifiés (présents dans new_values mais différents de old_values)
  const changedKeys =
    item.new_values && item.old_values
      ? Object.keys(item.new_values).filter(
          (k) => String(item.old_values![k] ?? '') !== String(item.new_values![k] ?? ''),
        )
      : item.new_values
        ? Object.keys(item.new_values)
        : [];

  return (
    <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.typeBadge, { backgroundColor: s.bg }]}>
        <Ionicons name={s.icon as any} size={16} color={s.color} />
      </View>
      <View style={styles.itemBody}>
        <View style={styles.itemTop}>
          <Text style={[styles.auditLabel, { color: s.color }]}>{item.event_label}</Text>
          <Text style={[styles.itemDate, { color: colors.textLight }]}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        {changedKeys.length > 0 ? (
          <Text style={[styles.itemNotes, { color: colors.textMuted }]} numberOfLines={3}>
            {changedKeys.join(', ')}
          </Text>
        ) : null}
        <Text style={[styles.itemCreateur, { color: colors.textMuted }]}>{item.actor_name}</Text>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ProduitHistoriqueScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<Tab>('stock');
  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [historique, setHistorique] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchHistoriqueStock(id ?? '');
    if (result.ok) {
      setMouvements(result.data.mouvements);
      setHistorique(result.data.historique);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'stock',  label: 'Historique du stock' },
    { key: 'global', label: 'Historique global' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={[styles.backLabel, { color: colors.primary }]}>Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Historique</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab bar */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        {tabs.map(({ key, label }) => {
          const active = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.tab,
                active
                  ? { borderBottomColor: colors.primary }
                  : { borderBottomColor: 'transparent' },
              ]}
              onPress={() => setActiveTab(key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.primary : colors.textMuted },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.danger }}>{error}</Text>
          <TouchableOpacity
            onPress={load}
            style={[styles.retryBtn, { borderColor: colors.border }]}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'stock' ? (
        mouvements.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="swap-vertical-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Aucun mouvement de stock
            </Text>
          </View>
        ) : (
          <FlatList
            data={mouvements}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MouvementItem item={item} />}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : historique.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="time-outline" size={40} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Aucun historique disponible
          </Text>
        </View>
      ) : (
        <FlatList
          data={historique}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AuditItem item={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  header:  {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn:      { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 4, minWidth: 80 },
  backLabel:    { fontSize: 16 },
  headerTitle:  { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  headerSpacer: { minWidth: 80 },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tabLabel: { fontSize: 13, fontWeight: '600' },

  center:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  emptyText: { fontSize: 14, marginTop: 8 },
  list:     { padding: 16, gap: 10 },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  typeBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  itemBody:  { flex: 1, gap: 4 },
  itemTop:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemQty:   { fontSize: 17, fontWeight: '800' },
  auditLabel: { fontSize: 14, fontWeight: '700' },
  itemStock:  { fontSize: 12 },
  itemNotes:  { fontSize: 13 },
  itemMeta:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  itemDate:   { fontSize: 11 },
  itemCreateur: { fontSize: 11 },
});
