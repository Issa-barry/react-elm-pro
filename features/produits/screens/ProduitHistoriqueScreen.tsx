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
import type { MouvementStock } from '../types/produit.types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function MouvementItem({ item }: { item: MouvementStock }) {
  const { colors } = useTheme();
  const isEntree = item.type === 'entree';
  const color = isEntree ? colors.success : colors.danger;
  const bg    = isEntree ? colors.successBg : colors.dangerBg;

  return (
    <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.typeBadge, { backgroundColor: bg }]}>
        <Ionicons name={isEntree ? 'arrow-up' : 'arrow-down'} size={16} color={color} />
      </View>
      <View style={styles.itemBody}>
        <View style={styles.itemTop}>
          <Text style={[styles.itemQty, { color }]}>
            {isEntree ? '+' : '-'}{item.quantite}
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
          <Text style={[styles.itemDate, { color: colors.textLight ?? colors.textMuted }]}>
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

export default function ProduitHistoriqueScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchHistoriqueStock(id ?? '');
    if (result.ok) {
      setMouvements(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={[styles.backLabel, { color: colors.primary }]}>Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Historique du stock</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.danger }}>{error}</Text>
          <TouchableOpacity onPress={load} style={[styles.retryBtn, { borderColor: colors.border }]}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : mouvements.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="swap-vertical-outline" size={40} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aucun mouvement de stock</Text>
        </View>
      ) : (
        <FlatList
          data={mouvements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MouvementItem item={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn:      { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 4, minWidth: 80 },
  backLabel:    { fontSize: 16 },
  headerTitle:  { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  headerSpacer: { minWidth: 80 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  retryBtn:     { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  emptyText:    { fontSize: 14, marginTop: 8 },
  list:         { padding: 16, gap: 10 },
  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 12, borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  typeBadge:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  itemBody:     { flex: 1, gap: 4 },
  itemTop:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemQty:      { fontSize: 17, fontWeight: '800' },
  itemStock:    { fontSize: 12 },
  itemNotes:    { fontSize: 13 },
  itemMeta:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  itemDate:     { fontSize: 11 },
  itemCreateur: { fontSize: 11 },
});
