import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
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
import AjusterStockModal from '../components/AjusterStockModal';
import ProduitCard from '../components/ProduitCard';
import { useProduits } from '../hooks/useProduits';
import type { Produit } from '../types/produit.types';

export default function ProduitsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { produits, loading, error, reload } = useProduits();

  const [modalProduit, setModalProduit] = useState<Produit | null>(null);

  function handlePressCard(produit: Produit) {
    router.push({ pathname: '/produits/[id]', params: { id: produit.id } });
  }

  function handleAjusterStock(produit: Produit) {
    setModalProduit(produit);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Produits</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/produits/create')}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && produits.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: colors.danger }}>{error}</Text>
          <TouchableOpacity onPress={reload} style={[styles.retryBtn, { borderColor: colors.border }]}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={produits}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ProduitCard
              produit={item}
              onPress={() => handlePressCard(item)}
              onAjusterStock={item.type_has_stock ? () => handleAjusterStock(item) : undefined}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: colors.textMuted }}>Aucun produit</Text>
            </View>
          }
          contentContainerStyle={
            produits.length === 0
              ? styles.emptyContainer
              : { paddingBottom: insets.bottom + 16, paddingTop: 8 }
          }
        />
      )}

      {modalProduit ? (
        <AjusterStockModal
          visible={true}
          produit={modalProduit}
          onClose={() => setModalProduit(null)}
          onSuccess={reload}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn:        { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  addBtn:         { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyContainer: { flex: 1 },
  retryBtn:       { marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
});
