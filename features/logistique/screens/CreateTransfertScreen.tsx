import { Image } from 'expo-image';
import { Stack, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import {
  createTransfert,
  fetchProduits,
  fetchRessources,
} from '../services/logistique-api.service';
import type { ProduitRef, SiteRef, VehiculeRef } from '../types/logistique.types';

// ── Calendrier ───────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function CalendarPicker({
  selected,
  onSelect,
  colors,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(() =>
    selected instanceof Date ? selected.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(() =>
    selected instanceof Date ? selected.getMonth() : today.getMonth()
  );

  const goToPrev = useCallback(() => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const goToNext = useCallback(() => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }, [viewMonth]);

  const cells = useMemo<(number | null)[]>(() => {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const offset = firstDow === 0 ? 6 : firstDow - 1;
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    const result: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= days; d++) result.push(d);
    return result;
  }, [viewYear, viewMonth]);

  return (
    <View style={{ padding: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <TouchableOpacity onPress={goToPrev} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={{ color: colors.primary, fontSize: 28, lineHeight: 32 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: '700', fontSize: 17, color: colors.text }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={goToNext} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={{ color: colors.primary, fontSize: 28, lineHeight: 32 }}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', color: colors.textMuted, fontWeight: '600', fontSize: 12 }}>
            {d}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, i) => {
          if (!day) return <View key={`e${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />;
          const isSelected = selected &&
            selected.getFullYear() === viewYear &&
            selected.getMonth() === viewMonth &&
            selected.getDate() === day;
          const isToday = today.getFullYear() === viewYear &&
            today.getMonth() === viewMonth &&
            today.getDate() === day;
          return (
            <TouchableOpacity
              key={`d${day}`}
              style={{ width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => onSelect(new Date(viewYear, viewMonth, day))}
              activeOpacity={0.7}
            >
              <View style={[
                { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
                isSelected ? { backgroundColor: colors.primary }
                  : isToday ? { borderWidth: 1.5, borderColor: colors.primary }
                  : {},
              ]}>
                <Text style={{
                  color: isSelected ? '#fff' : isToday ? colors.primary : colors.text,
                  fontWeight: isSelected || isToday ? '700' : '400',
                  fontSize: 14,
                }}>
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date | null): string {
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function dateToApi(d: Date | null): string | undefined {
  if (!d) return undefined;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Types ────────────────────────────────────────────────────────────────────

type ModalMode = 'site_dest' | 'vehicule' | 'produit' | 'date_depart' | 'date_arrivee';

interface LigneForm {
  produit: ProduitRef;
  quantite: string;
}

// ── Écran principal ──────────────────────────────────────────────────────────

export default function CreateTransfertScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Ressources
  const [sites, setSites] = useState<SiteRef[]>([]);
  const [vehicules, setVehicules] = useState<VehiculeRef[]>([]);
  const [produits, setProduits] = useState<ProduitRef[]>([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [resError, setResError] = useState<string | null>(null);

  // Formulaire
  const [siteSource, setSiteSource] = useState<SiteRef | null>(null);
  const [siteDest, setSiteDest] = useState<SiteRef | null>(null);
  const [vehicule, setVehicule] = useState<VehiculeRef | null>(null);
  const [dateDepart, setDateDepart] = useState<Date | null>(null);
  const [dateArrivee, setDateArrivee] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [lignes, setLignes] = useState<LigneForm[]>([]);
  const [saving, setSaving] = useState(false);

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [modalSearch, setModalSearch] = useState('');
  const [pendingProduit, setPendingProduit] = useState<ProduitRef | null>(null);
  const [pendingQty, setPendingQty] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoadingRes(true);
    Promise.all([fetchRessources(), fetchProduits()]).then(([res, prod]) => {
      if (cancelled) return;
      if (!res.ok) { setResError(res.error); setLoadingRes(false); return; }
      setSites(res.data.sites);
      setVehicules(res.data.vehicules);
      if (res.data.user_site) setSiteSource(res.data.user_site);
      if (prod.ok) setProduits(prod.data);
      setLoadingRes(false);
    });
    return () => { cancelled = true; };
  }, []);

  const openModal = useCallback((mode: ModalMode) => {
    setModalSearch('');
    if (mode === 'produit') { setPendingProduit(null); setPendingQty(''); }
    setModalMode(mode);
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setModalSearch('');
    setPendingProduit(null);
  }, []);

  const confirmProduit = useCallback(() => {
    if (!pendingProduit) return;
    const qty = parseInt(pendingQty, 10);
    if (!qty || qty < 1) { Alert.alert('Quantité invalide', 'Saisir une quantité ≥ 1.'); return; }
    setLignes(prev => {
      const idx = prev.findIndex(l => l.produit.id === pendingProduit.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { produit: pendingProduit, quantite: String(qty) };
        return next;
      }
      return [...prev, { produit: pendingProduit, quantite: String(qty) }];
    });
    closeModal();
  }, [pendingProduit, pendingQty, closeModal]);

  const removeLigne = useCallback((produitId: string) => {
    setLignes(prev => prev.filter(l => l.produit.id !== produitId));
  }, []);

  const updateLigneQty = useCallback((produitId: string, val: string) => {
    setLignes(prev => prev.map(l => l.produit.id === produitId ? { ...l, quantite: val.replace(/[^0-9]/g, '') } : l));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!siteSource || !siteDest || lignes.length === 0) return;
    setSaving(true);
    const result = await createTransfert({
      site_source_id:      siteSource.id,
      site_destination_id: siteDest.id,
      vehicule_id:         vehicule?.id,
      date_depart_prevue:  dateToApi(dateDepart),
      date_arrivee_prevue: dateToApi(dateArrivee),
      notes:               notes.trim() || undefined,
      lignes: lignes.map(l => ({
        produit_id:        l.produit.id,
        quantite_demandee: parseInt(l.quantite, 10),
      })),
    });
    setSaving(false);
    if (!result.ok) { Alert.alert('Erreur', result.error); return; }
    router.replace(`/logistique/${result.data.id}` as never);
  }, [siteSource, siteDest, vehicule, dateDepart, dateArrivee, notes, lignes]);

  // ── Listes filtrées ──────────────────────────────────────────────────────────
  const filteredSites = useMemo(() => {
    const q = modalSearch.toLowerCase();
    return q ? sites.filter(s => s.nom.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) : sites;
  }, [sites, modalSearch]);

  const filteredVehicules = useMemo(() => {
    const q = modalSearch.toLowerCase();
    return q ? vehicules.filter(v =>
      v.nom_vehicule.toLowerCase().includes(q) || v.immatriculation.toLowerCase().includes(q)
    ) : vehicules;
  }, [vehicules, modalSearch]);

  const filteredProduits = useMemo(() => {
    const q = modalSearch.toLowerCase();
    return q ? produits.filter(p =>
      p.nom.toLowerCase().includes(q) || (p.code_interne ?? '').toLowerCase().includes(q)
    ) : produits;
  }, [produits, modalSearch]);

  const canSubmit = !!siteSource && !!siteDest && lignes.length > 0 && !saving;

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (loadingRes) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  if (resError) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: colors.danger }}>{resError}</Text>
      </View>
    );
  }

  // ── Modal title ──────────────────────────────────────────────────────────────
  const modalTitle =
    modalMode === 'site_dest'    ? 'Site arrivée'
    : modalMode === 'vehicule'   ? 'Véhicule'
    : modalMode === 'date_depart'  ? 'Date de départ'
    : modalMode === 'date_arrivee' ? "Date d'arrivée"
    : pendingProduit             ? pendingProduit.nom
    : 'Ajouter un produit';

  const isQtyStep = modalMode === 'produit' && pendingProduit !== null;
  const isCalendar = modalMode === 'date_depart' || modalMode === 'date_arrivee';

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.primary }]}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Nouveau transfert</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Trajet ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>TRAJET *</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Site départ — lecture seule (auto depuis compte) */}
          <View style={styles.pickerRow}>
            <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>Site départ</Text>
            <Text style={[styles.pickerValue, { color: siteSource ? colors.text : colors.textMuted }]} numberOfLines={1}>
              {siteSource ? siteSource.nom : '—'}
            </Text>
            <View style={{ width: 16 }} />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {/* Site arrivée — sélectable */}
          <TouchableOpacity style={styles.pickerRow} onPress={() => openModal('site_dest')} activeOpacity={0.7}>
            <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>Site arrivée</Text>
            <Text style={[styles.pickerValue, { color: siteDest ? colors.text : colors.textMuted }]} numberOfLines={1}>
              {siteDest ? siteDest.nom : 'Choisir…'}
            </Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Véhicule ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>VÉHICULE</Text>
        <TouchableOpacity
          style={[styles.card, styles.pickerRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => openModal('vehicule')}
          activeOpacity={0.7}
        >
          <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>Véhicule</Text>
          <Text style={[styles.pickerValue, { color: vehicule ? colors.text : colors.textMuted }]} numberOfLines={1}>
            {vehicule ? `${vehicule.nom_vehicule} · ${vehicule.immatriculation}` : 'Optionnel'}
          </Text>
          {vehicule ? (
            <TouchableOpacity onPress={() => setVehicule(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.clearBtn, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          )}
        </TouchableOpacity>

        {/* ── Produits ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PRODUITS *</Text>
        {lignes.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 8 }]}>
            {lignes.map((ligne, i) => (
              <View key={ligne.produit.id}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.ligneRow}>
                  {ligne.produit.image_url ? (
                    <Image source={{ uri: ligne.produit.image_url }} style={styles.ligneImg} contentFit="cover" />
                  ) : (
                    <View style={[styles.ligneImg, styles.ligneImgPlaceholder, { backgroundColor: colors.infoBg }]}>
                      <Text style={{ fontSize: 16 }}>📦</Text>
                    </View>
                  )}
                  <View style={styles.ligneInfo}>
                    <Text style={[styles.ligneNom, { color: colors.text }]} numberOfLines={1}>{ligne.produit.nom}</Text>
                    {ligne.produit.code_interne ? (
                      <Text style={[styles.ligneCode, { color: colors.textMuted }]}>{ligne.produit.code_interne}</Text>
                    ) : null}
                  </View>
                  <TextInput
                    style={[styles.qtyInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                    value={ligne.quantite}
                    onChangeText={v => updateLigneQty(ligne.produit.id, v)}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TouchableOpacity onPress={() => removeLigne(ligne.produit.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.removeBtn, { color: colors.danger }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={[styles.addLigneBtn, { backgroundColor: colors.surface, borderColor: colors.primary }]}
          onPress={() => openModal('produit')}
          activeOpacity={0.7}
        >
          <Text style={[styles.addLigneBtnText, { color: colors.primary }]}>+ Ajouter un produit</Text>
        </TouchableOpacity>

        {/* ── Dates ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>DATES</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.dateRow} onPress={() => openModal('date_depart')} activeOpacity={0.7}>
            <Text style={[styles.dateLabel, { color: colors.textMuted }]}>Départ prévu</Text>
            <Text style={[styles.dateValue, { color: dateDepart ? colors.text : colors.textMuted }]}>
              {dateDepart ? formatDate(dateDepart) : 'JJ/MM/AAAA'}
            </Text>
            {dateDepart ? (
              <TouchableOpacity onPress={() => setDateDepart(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.clearBtn, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            )}
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.dateRow} onPress={() => openModal('date_arrivee')} activeOpacity={0.7}>
            <Text style={[styles.dateLabel, { color: colors.textMuted }]}>Arrivée prévue</Text>
            <Text style={[styles.dateValue, { color: dateArrivee ? colors.text : colors.textMuted }]}>
              {dateArrivee ? formatDate(dateArrivee) : 'JJ/MM/AAAA'}
            </Text>
            {dateArrivee ? (
              <TouchableOpacity onPress={() => setDateArrivee(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.clearBtn, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Notes ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>NOTES</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.notesInput, { color: colors.text }]}
            placeholder="Informations complémentaires…"
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* ── Footer ── */}
      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: canSubmit ? 1 : 0.4 }]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Créer le transfert</Text>
          }
        </TouchableOpacity>
      </View>

      {/* ── Modal ── */}
      <Modal
        visible={modalMode !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalRoot, { backgroundColor: colors.background, paddingTop: insets.top }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            {isQtyStep && (
              <TouchableOpacity onPress={() => setPendingProduit(null)} style={styles.modalBackBtn}>
                <Text style={[styles.modalBackLabel, { color: colors.primary }]}>‹</Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>{modalTitle}</Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={[styles.modalCloseLabel, { color: colors.primary }]}>Fermer</Text>
            </TouchableOpacity>
          </View>

          {/* Calendrier */}
          {isCalendar && (
            <ScrollView>
              <CalendarPicker
                selected={modalMode === 'date_depart' ? dateDepart : dateArrivee}
                onSelect={d => {
                  if (modalMode === 'date_depart') setDateDepart(d);
                  else setDateArrivee(d);
                  closeModal();
                }}
                colors={colors}
              />
            </ScrollView>
          )}

          {/* Saisie quantité */}
          {isQtyStep && (
            <View style={styles.qtyStep}>
              <Text style={[styles.qtyStepLabel, { color: colors.textMuted }]}>Quantité demandée</Text>
              <TextInput
                style={[styles.qtyStepInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={pendingQty}
                onChangeText={v => setPendingQty(v.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                autoFocus
                maxLength={6}
              />
              <TouchableOpacity
                style={[styles.qtyStepBtn, { backgroundColor: colors.primary, opacity: pendingQty && parseInt(pendingQty, 10) >= 1 ? 1 : 0.4 }]}
                onPress={confirmProduit}
                disabled={!pendingQty || parseInt(pendingQty, 10) < 1}
              >
                <Text style={styles.qtyStepBtnText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Listes de sélection */}
          {!isCalendar && !isQtyStep && (
            <>
              <View style={[styles.searchWrap, { borderBottomColor: colors.border }]}>
                <TextInput
                  style={[styles.searchInput, { color: colors.text, backgroundColor: colors.surface }]}
                  placeholder="Rechercher…"
                  placeholderTextColor={colors.textMuted}
                  value={modalSearch}
                  onChangeText={setModalSearch}
                  autoFocus
                  clearButtonMode="while-editing"
                />
              </View>

              {/* Sites */}
              {modalMode === 'site_dest' && (
                <FlatList
                  data={filteredSites}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.listItem, { borderBottomColor: colors.border }]}
                      onPress={() => { setSiteDest(item); closeModal(); }}
                    >
                      <View style={styles.listItemBody}>
                        <Text style={[styles.listItemTitle, { color: colors.text }]}>{item.nom}</Text>
                        <Text style={[styles.listItemSub, { color: colors.textMuted }]}>{item.code}</Text>
                      </View>
                      {item.id === siteDest?.id && <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text style={[styles.emptyList, { color: colors.textMuted }]}>Aucun site trouvé</Text>}
                />
              )}

              {/* Véhicules */}
              {modalMode === 'vehicule' && (
                <FlatList
                  data={filteredVehicules}
                  keyExtractor={item => item.id}
                  ListHeaderComponent={
                    <TouchableOpacity
                      style={[styles.listItem, { borderBottomColor: colors.border }]}
                      onPress={() => { setVehicule(null); closeModal(); }}
                    >
                      <Text style={[styles.listItemTitle, { color: colors.textMuted }]}>Aucun véhicule</Text>
                      {!vehicule && <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>}
                    </TouchableOpacity>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.listItem, { borderBottomColor: colors.border }]}
                      onPress={() => { setVehicule(item); closeModal(); }}
                    >
                      <View style={styles.listItemBody}>
                        <Text style={[styles.listItemTitle, { color: colors.text }]}>{item.nom_vehicule}</Text>
                        <Text style={[styles.listItemSub, { color: colors.textMuted }]}>{item.immatriculation}</Text>
                      </View>
                      {item.id === vehicule?.id && <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text style={[styles.emptyList, { color: colors.textMuted }]}>Aucun véhicule disponible</Text>}
                />
              )}

              {/* Produits */}
              {modalMode === 'produit' && (
                <FlatList
                  data={filteredProduits}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => {
                    const alreadyAdded = lignes.some(l => l.produit.id === item.id);
                    return (
                      <TouchableOpacity
                        style={[styles.listItem, { borderBottomColor: colors.border }]}
                        onPress={() => {
                          setPendingProduit(item);
                          setPendingQty(lignes.find(l => l.produit.id === item.id)?.quantite ?? '');
                        }}
                      >
                        {item.image_url ? (
                          <Image source={{ uri: item.image_url }} style={styles.produitImg} contentFit="cover" />
                        ) : (
                          <View style={[styles.produitImg, styles.produitImgPlaceholder, { backgroundColor: colors.infoBg }]}>
                            <Text style={{ fontSize: 22 }}>📦</Text>
                          </View>
                        )}
                        <View style={styles.listItemBody}>
                          <Text style={[styles.listItemTitle, { color: colors.text }]}>{item.nom}</Text>
                          {item.code_interne ? (
                            <Text style={[styles.listItemSub, { color: colors.textMuted }]}>{item.code_interne}</Text>
                          ) : null}
                        </View>
                        {alreadyAdded && <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>}
                        <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={<Text style={[styles.emptyList, { color: colors.textMuted }]}>Aucun produit trouvé</Text>}
                />
              )}
            </>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    root:    { flex: 1, backgroundColor: colors.background },
    center:  { alignItems: 'center', justifyContent: 'center' },
    scroll:  { flex: 1 },
    content: { padding: 16, gap: 4 },

    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn:      { minWidth: 60 },
    backLabel:    { fontSize: 17 },
    headerTitle:  { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
    headerSpacer: { minWidth: 60 },

    sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginTop: 14, marginBottom: 6, marginLeft: 4 },

    card:    { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },

    pickerRow:   { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
    pickerLabel: { width: 80, fontSize: 14 },
    pickerValue: { flex: 1, fontSize: 15 },
    chevron:     { fontSize: 20 },
    clearBtn:    { fontSize: 16, paddingHorizontal: 2 },

    ligneRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
    ligneImg: { width: 42, height: 42, borderRadius: 8 },
    ligneImgPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    ligneInfo: { flex: 1 },
    ligneNom:  { fontSize: 14, fontWeight: '600' },
    ligneCode: { fontSize: 11, marginTop: 1 },
    qtyInput: {
      borderWidth: 1, borderRadius: 8,
      paddingHorizontal: 8, paddingVertical: 6,
      width: 60, textAlign: 'center',
      fontSize: 15, fontWeight: '700',
    },
    removeBtn: { fontSize: 16, paddingHorizontal: 2 },

    addLigneBtn: {
      borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed',
      paddingVertical: 12, alignItems: 'center', marginTop: 0,
    },
    addLigneBtnText: { fontSize: 14, fontWeight: '700' },

    dateRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 8 },
    dateLabel: { flex: 1, fontSize: 14 },
    dateValue: { fontSize: 15 },

    notesInput: { padding: 14, fontSize: 14, minHeight: 80 },

    footer:        { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
    submitBtn:     { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    // Modal
    modalRoot:   { flex: 1 },
    modalHeader: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    modalBackBtn:   { marginRight: 6 },
    modalBackLabel: { fontSize: 26, lineHeight: 30 },
    modalTitle:     { flex: 1, fontSize: 16, fontWeight: '700' },
    modalCloseLabel: { fontSize: 15 },

    searchWrap:   { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 8 },
    searchInput:  { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 15 },

    listItem:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
    listItemBody:  { flex: 1 },
    listItemTitle: { fontSize: 15 },
    listItemSub:   { fontSize: 12, marginTop: 2 },
    checkmark:     { fontSize: 18, fontWeight: '700' },
    emptyList:     { textAlign: 'center', padding: 32, fontSize: 14 },

    produitImg:            { width: 52, height: 52, borderRadius: 10 },
    produitImgPlaceholder: { alignItems: 'center', justifyContent: 'center' },

    qtyStep:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
    qtyStepLabel:  { fontSize: 14 },
    qtyStepInput:  {
      borderWidth: 1, borderRadius: 14,
      paddingHorizontal: 24, paddingVertical: 16,
      fontSize: 32, fontWeight: '700',
      textAlign: 'center', minWidth: 160,
    },
    qtyStepBtn:     { borderRadius: 14, paddingHorizontal: 48, paddingVertical: 14 },
    qtyStepBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  });
}
