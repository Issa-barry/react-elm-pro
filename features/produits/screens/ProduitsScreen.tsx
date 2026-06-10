import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import AjusterStockModal from '../components/AjusterStockModal';
import ProduitCard from '../components/ProduitCard';
import { useProduits } from '../hooks/useProduits';
import type { Produit } from '../types/produit.types';

type StatutFilter = 'tous' | 'actif' | 'inactif' | 'archive';
type TypeFilter   = 'materiel' | 'service' | 'fabricable' | 'achat_vente';

const STATUT_OPTIONS: { key: StatutFilter; label: string }[] = [
  { key: 'tous',    label: 'Tous' },
  { key: 'actif',   label: 'Actif' },
  { key: 'inactif', label: 'Inactif' },
  { key: 'archive', label: 'Archivé' },
];

const TYPE_OPTIONS: { key: TypeFilter; label: string }[] = [
  { key: 'materiel',    label: 'Matériel' },
  { key: 'service',     label: 'Service' },
  { key: 'fabricable',  label: 'Fabricable' },
  { key: 'achat_vente', label: 'Achat/Vente' },
];

// ─── Filter modal ─────────────────────────────────────────────────────────────

interface FilterModalProps {
  visible: boolean;
  statut: StatutFilter;
  types: TypeFilter[];
  alerte: boolean;
  onApply: (s: StatutFilter, t: TypeFilter[], a: boolean) => void;
  onClose: () => void;
}

function FilterModal({ visible, statut, types, alerte, onApply, onClose }: FilterModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [tmpStatut, setTmpStatut] = useState<StatutFilter>(statut);
  const [tmpTypes, setTmpTypes]   = useState<TypeFilter[]>(types);
  const [tmpAlerte, setTmpAlerte] = useState(alerte);

  function handleOpen() {
    setTmpStatut(statut);
    setTmpTypes(types);
    setTmpAlerte(alerte);
  }

  function handleReset() {
    setTmpStatut('tous');
    setTmpTypes([]);
    setTmpAlerte(false);
  }

  function toggleType(key: TypeFilter) {
    setTmpTypes(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  function handleApply() {
    onApply(tmpStatut, tmpTypes, tmpAlerte);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <View style={styles.modalContainer}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 16 }]}>
        {/* Drag bar */}
        <View style={[styles.dragBar, { backgroundColor: colors.border }]} />

        {/* Sheet header */}
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Filtrer les produits</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Statut */}
          <Text style={[styles.filterLabel, { color: colors.textMuted }]}>STATUT</Text>
          <View style={styles.optionGroup}>
            {STATUT_OPTIONS.map(opt => {
              const active = tmpStatut === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionChip,
                    active
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                  ]}
                  onPress={() => setTmpStatut(opt.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionLabel, { color: active ? '#fff' : colors.text }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Type — multi-sélect */}
          <Text style={[styles.filterLabel, { color: colors.textMuted, marginTop: 20 }]}>TYPE</Text>
          <View style={styles.optionGroup}>
            {TYPE_OPTIONS.map(opt => {
              const active = tmpTypes.includes(opt.key);
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionChip,
                    active
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                  ]}
                  onPress={() => toggleType(opt.key)}
                  activeOpacity={0.7}
                >
                  {active && <Ionicons name="checkmark" size={13} color="#fff" style={{ marginRight: 4 }} />}
                  <Text style={[styles.optionLabel, { color: active ? '#fff' : colors.text }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Alerte toggle */}
          <Text style={[styles.filterLabel, { color: colors.textMuted, marginTop: 20 }]}>OPTIONS</Text>
          <TouchableOpacity
            style={[
              styles.toggleRow,
              { backgroundColor: colors.surfaceAlt, borderColor: tmpAlerte ? colors.warning : colors.border },
            ]}
            onPress={() => setTmpAlerte(v => !v)}
            activeOpacity={0.8}
          >
            <View style={styles.toggleLeft}>
              <Ionicons name="warning-outline" size={18} color={tmpAlerte ? colors.warning : colors.textMuted} />
              <Text style={[styles.toggleLabel, { color: tmpAlerte ? colors.warning : colors.text }]}>
                Produits en alerte stock uniquement
              </Text>
            </View>
            <View style={[
              styles.toggleCheck,
              { backgroundColor: tmpAlerte ? colors.warning : colors.border },
            ]}>
              {tmpAlerte && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Actions */}
        <View style={styles.sheetActions}>
          <TouchableOpacity
            style={[styles.resetBtn, { borderColor: colors.border }]}
            onPress={handleReset}
          >
            <Text style={[styles.resetBtnText, { color: colors.textMuted }]}>Réinitialiser</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            onPress={handleApply}
          >
            <Text style={styles.applyBtnText}>Appliquer</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ProduitsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { produits, loading, error, reload } = useProduits();

  const [modalProduit, setModalProduit] = useState<Produit | null>(null);
  const [showFilter, setShowFilter]     = useState(false);
  const [search, setSearch]             = useState('');
  const [statutFilter, setStatutFilter] = useState<StatutFilter>('tous');
  const [typeFilter, setTypeFilter]     = useState<TypeFilter[]>([]);
  const [alerteOnly, setAlerteOnly]     = useState(false);

  const activeFilterCount = (statutFilter !== 'tous' ? 1 : 0) + (typeFilter.length > 0 ? 1 : 0) + (alerteOnly ? 1 : 0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return produits.filter(p => {
      if (q && !p.nom.toLowerCase().includes(q) && !(p.code_interne ?? '').toLowerCase().includes(q)) return false;
      if (statutFilter !== 'tous' && p.statut !== statutFilter) return false;
      if (typeFilter.length > 0 && !typeFilter.includes(p.type as TypeFilter)) return false;
      if (alerteOnly && !p.is_alerte) return false;
      return true;
    });
  }, [produits, search, statutFilter, typeFilter, alerteOnly]);

  const hasActiveFilter = activeFilterCount > 0 || search.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header (couvre le status bar) ── */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Produits</Text>
        <TouchableOpacity
          style={[styles.headerAddBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/produits/create')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Search + Filter bar ── */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher un produit…"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            {
              backgroundColor: activeFilterCount > 0 ? colors.primary : colors.surfaceAlt,
              borderColor: activeFilterCount > 0 ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setShowFilter(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? '#fff' : colors.text} />
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: '#fff' }]}>
              <Text style={[styles.filterBadgeText, { color: colors.primary }]}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Résumé des filtres actifs */}
      {hasActiveFilter && (
        <View style={[styles.filterSummary, { backgroundColor: colors.infoBg, borderBottomColor: colors.border }]}>
          <Text style={[styles.filterSummaryText, { color: colors.primary }]} numberOfLines={1}>
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            {statutFilter !== 'tous' ? ` · ${STATUT_OPTIONS.find(o => o.key === statutFilter)?.label}` : ''}
            {typeFilter.length > 0 ? ` · ${typeFilter.map(t => TYPE_OPTIONS.find(o => o.key === t)?.label).join(', ')}` : ''}
            {alerteOnly ? ' · Alerte' : ''}
            {search.trim() ? ` · "${search.trim()}"` : ''}
          </Text>
          <TouchableOpacity
            onPress={() => { setSearch(''); setStatutFilter('tous'); setTypeFilter([]); setAlerteOnly(false); }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="close-circle" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── List ── */}
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
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ProduitCard
              produit={item}
              onPress={() => router.push({ pathname: '/produits/[id]', params: { id: item.id } })}
              onAjusterStock={item.type_has_stock ? () => setModalProduit(item) : undefined}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={36} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {hasActiveFilter ? 'Aucun produit ne correspond aux filtres' : 'Aucun produit'}
              </Text>
            </View>
          }
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
        />
      )}

      {/* ── Ajuster stock modal ── */}
      {modalProduit ? (
        <AjusterStockModal
          visible={true}
          produit={modalProduit}
          onClose={() => setModalProduit(null)}
          onSuccess={reload}
        />
      ) : null}

      {/* ── Filter sheet ── */}
      <FilterModal
        visible={showFilter}
        statut={statutFilter}
        types={typeFilter}
        alerte={alerteOnly}
        onApply={(s, t, a) => { setStatutFilter(s); setTypeFilter(t); setAlerteOnly(a); setShowFilter(false); }}
        onClose={() => setShowFilter(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  headerBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  headerAddBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { fontSize: 10, fontWeight: '800' },

  // Filter summary
  filterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterSummaryText: { fontSize: 12, fontWeight: '600', flex: 1, marginRight: 8 },

  // List
  listContent:    { paddingBottom: 32, paddingTop: 8 },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  emptyContainer: { flex: 1 },
  emptyText:      { fontSize: 14, textAlign: 'center' },
  retryBtn:       { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },

  // Filter modal / bottom sheet
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    flex: 1,
    maxHeight: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  dragBar:     { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sheetTitle:  { fontSize: 16, fontWeight: '700' },

  filterLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 10 },
  optionGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionLabel: { fontSize: 13, fontWeight: '600' },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  toggleLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '500', flex: 1 },
  toggleCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetBtnText: { fontSize: 14, fontWeight: '600' },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
