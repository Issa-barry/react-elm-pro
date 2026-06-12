import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { StatutBadge } from '../components/StatutBadge';
import { useTransfertDetail } from '../hooks/useTransfertDetail';
import { validationAdmin } from '../services/logistique-api.service';
import type { TransfertLigne } from '../types/logistique.types';

function formatNum(val: number | null | undefined): string {
  if (val == null) return '—';
  return new Intl.NumberFormat('fr-FR').format(val);
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function LigneCard({ ligne }: { ligne: TransfertLigne }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const ecartColors: Record<string, string> = {
    conforme: colors.success,
    casse: colors.danger,
    perte: colors.danger,
    surplus: colors.warning,
    manquant: colors.warning,
  };
  return (
    <View style={[styles.ligneCard, { borderColor: colors.border }]}>
      <View style={styles.ligneTop}>
        <Text style={[styles.ligneNom, { color: colors.text }]} numberOfLines={2}>
          {ligne.produit_nom ?? 'Produit'}
        </Text>
        {ligne.ecart_type && (
          <View style={[styles.ecartBadge, { backgroundColor: ecartColors[ligne.ecart_type] + '20' }]}>
            <Text style={[styles.ecartLabel, { color: ecartColors[ligne.ecart_type] ?? colors.textMuted }]}>
              {ligne.ecart_label}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.ligneQtys}>
        <View style={styles.qtyCol}>
          <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>Demandé</Text>
          <Text style={[styles.qtyVal, { color: colors.text }]}>{formatNum(ligne.quantite_demandee)}</Text>
        </View>
        {ligne.quantite_chargee != null && (
          <View style={styles.qtyCol}>
            <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>Chargé</Text>
            <Text style={[styles.qtyVal, { color: colors.text }]}>{formatNum(ligne.quantite_chargee)}</Text>
          </View>
        )}
        {ligne.quantite_recue != null && (
          <View style={styles.qtyCol}>
            <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>Reçu</Text>
            <Text style={[styles.qtyVal, { color: colors.text }]}>{formatNum(ligne.quantite_recue)}</Text>
          </View>
        )}
        {ligne.ecart != null && ligne.ecart !== 0 && (
          <View style={styles.qtyCol}>
            <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>Écart</Text>
            <Text style={[styles.qtyVal, { color: ligne.ecart > 0 ? colors.success : colors.danger }]}>
              {ligne.ecart > 0 ? '+' : ''}{formatNum(ligne.ecart)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function TransfertDetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transfert, loading, error, load, reload } = useTransfertDetail(id ?? '');
  const [acting, setActing] = useState(false);
  const [refusMotif, setRefusMotif] = useState('');
  const [showRefusInput, setShowRefusInput] = useState(false);

  useEffect(() => { load(); }, [load]);

  const handleValidationAdmin = useCallback((decision: 'accord' | 'refus' | 'invalider') => {
    if (decision === 'refus' && !showRefusInput) {
      setShowRefusInput(true);
      return;
    }

    const msg = decision === 'accord'
      ? 'Approuver cette réception et générer la commission ?'
      : decision === 'refus'
      ? `Refuser cette réception avec le motif : "${refusMotif}" ?`
      : 'Invalider cette réception et la renvoyer en transit ?';

    Alert.alert(
      decision === 'accord' ? 'Approuver' : decision === 'refus' ? 'Refuser' : 'Invalider',
      msg,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: decision === 'refus' || decision === 'invalider' ? 'destructive' : 'default',
          onPress: async () => {
            setActing(true);
            setShowRefusInput(false);
            const result = await validationAdmin(id ?? '', {
              decision,
              motif: decision === 'refus' ? refusMotif : undefined,
            });
            setActing(false);
            if (result.ok) {
              reload();
            } else {
              Alert.alert('Erreur', result.error);
            }
          },
        },
      ]
    );
  }, [id, reload, refusMotif, showRefusInput]);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (loading) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backLabel, { color: colors.primary }]}>‹ Retour</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      </View>
    );
  }

  if (error || !transfert) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backLabel, { color: colors.primary }]}>‹ Retour</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={{ color: colors.danger }}>{error ?? 'Transfert introuvable.'}</Text>
          <TouchableOpacity onPress={load} style={[styles.btn, { backgroundColor: colors.primary }]}>
            <Text style={styles.btnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const canSaisirReception = transfert.statut === 'transit';
  const canValidateAdmin = transfert.statut === 'reception' && !transfert.validation_reception;
  const hasCommission = !!transfert.commission;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.primary }]}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.headerRef, { color: colors.text }]} numberOfLines={1}>
          {transfert.reference}
        </Text>
        <StatutBadge statut={transfert.statut} label={transfert.statut_label} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Trajet */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>TRAJET</Text>
          <Text style={[styles.trajetText, { color: colors.text }]}>
            {transfert.site_source.nom} → {transfert.site_destination.nom}
          </Text>
        </View>

        {/* Infos */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>INFORMATIONS</Text>
          {transfert.vehicule && (
            <InfoRow label="Véhicule" value={`${transfert.vehicule.nom_vehicule} · ${transfert.vehicule.immatriculation}`} />
          )}
          {transfert.equipe && <InfoRow label="Équipe" value={transfert.equipe.nom} />}
          <InfoRow label="Départ prévu" value={formatDate(transfert.date_depart_prevue)} />
          <InfoRow label="Arrivée prévue" value={formatDate(transfert.date_arrivee_prevue)} />
          <InfoRow label="Arrivée réelle" value={formatDate(transfert.date_arrivee_reelle)} />
          <InfoRow label="Packs demandés" value={formatNum(transfert.nb_packs_demandes)} />
          {transfert.nb_packs_charges != null && (
            <InfoRow label="Packs chargés" value={formatNum(transfert.nb_packs_charges)} />
          )}
          {transfert.nb_packs_recus != null && (
            <InfoRow label="Packs reçus" value={formatNum(transfert.nb_packs_recus)} />
          )}
        </View>

        {/* Validation admin */}
        {transfert.validation_reception && (
          <View style={[styles.section, {
            backgroundColor: transfert.validation_reception === 'accord' ? colors.successBg : colors.dangerBg,
            borderColor: transfert.validation_reception === 'accord' ? colors.success : colors.danger,
          }]}>
            <Text style={[styles.sectionTitle, { color: transfert.validation_reception === 'accord' ? colors.success : colors.danger }]}>
              {transfert.validation_reception === 'accord' ? 'RÉCEPTION APPROUVÉE' : 'RÉCEPTION REFUSÉE'}
            </Text>
            {transfert.validation_motif && (
              <Text style={[styles.motif, { color: colors.text }]}>{transfert.validation_motif}</Text>
            )}
          </View>
        )}

        {/* Lignes */}
        {transfert.lignes.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PRODUITS</Text>
            {transfert.lignes.map(ligne => <LigneCard key={ligne.id} ligne={ligne} />)}
          </View>
        )}

        {/* Commission */}
        {hasCommission && transfert.commission && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>COMMISSION</Text>
            <InfoRow label="Total" value={`${formatNum(transfert.commission.montant_total)} GNF`} />
            <InfoRow label="Versé" value={`${formatNum(transfert.commission.montant_verse)} GNF`} />
            <InfoRow label="Restant" value={`${formatNum(transfert.commission.montant_restant)} GNF`} />
            <InfoRow label="Statut" value={transfert.commission.statut_label} />
            {transfert.commission.parts.map(part => (
              <View key={part.id} style={[styles.partRow, { backgroundColor: colors.background }]}>
                <Text style={[styles.partNom, { color: colors.text }]}>{part.beneficiaire_nom}</Text>
                <Text style={[styles.partMontant, { color: colors.primary }]}>
                  {formatNum(part.montant_net)} GNF
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Refus motif input */}
        {showRefusInput && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>MOTIF DU REFUS</Text>
            <TextInput
              style={[styles.motifInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
              value={refusMotif}
              onChangeText={setRefusMotif}
              placeholder="Expliquer le motif du refus..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={[styles.actions, { borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        {canSaisirReception && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/logistique/${id}/reception` as never)}
            disabled={acting}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Saisir la réception</Text>
          </TouchableOpacity>
        )}

        {canValidateAdmin && !showRefusInput && (
          <View style={styles.adminBtns}>
            <TouchableOpacity
              style={[styles.btn, styles.btnFlex, { backgroundColor: colors.success }]}
              onPress={() => handleValidationAdmin('accord')}
              disabled={acting}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>✓ Approuver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnFlex, { backgroundColor: colors.danger }]}
              onPress={() => handleValidationAdmin('refus')}
              disabled={acting}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>✗ Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnFlex, { backgroundColor: colors.warning }]}
              onPress={() => handleValidationAdmin('invalider')}
              disabled={acting}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>↩ Invalider</Text>
            </TouchableOpacity>
          </View>
        )}

        {showRefusInput && (
          <View style={styles.adminBtns}>
            <TouchableOpacity
              style={[styles.btn, styles.btnFlex, { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border }]}
              onPress={() => { setShowRefusInput(false); setRefusMotif(''); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnText, { color: colors.text }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnFlex, { backgroundColor: colors.danger, opacity: !refusMotif.trim() ? 0.5 : 1 }]}
              onPress={() => handleValidationAdmin('refus')}
              disabled={!refusMotif.trim() || acting}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Confirmer le refus</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    root:    { flex: 1, backgroundColor: colors.background },
    scroll:  { flex: 1 },
    content: { padding: 16, gap: 12 },
    center:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },

    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
    backBtn: {},
    backLabel: { fontSize: 17 },
    headerRef: { flex: 1, fontSize: 15, fontWeight: '700' },

    section:      { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10 },
    sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },

    trajetText: { fontSize: 15, fontWeight: '600' },

    infoRow:    { flexDirection: 'row', justifyContent: 'space-between' },
    infoLabel:  { fontSize: 13, flex: 1 },
    infoValue:  { fontSize: 13, fontWeight: '600', textAlign: 'right', flex: 1 },

    motif:    { fontSize: 13 },

    ligneCard: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, gap: 6 },
    ligneTop:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
    ligneNom:  { fontSize: 14, fontWeight: '600', flex: 1 },
    ecartBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    ecartLabel: { fontSize: 11, fontWeight: '600' },
    ligneQtys: { flexDirection: 'row', gap: 16 },
    qtyCol:    { gap: 2 },
    qtyLabel:  { fontSize: 11 },
    qtyVal:    { fontSize: 14, fontWeight: '700' },

    partRow:      { flexDirection: 'row', justifyContent: 'space-between', padding: 8, borderRadius: 8 },
    partNom:      { fontSize: 13 },
    partMontant:  { fontSize: 13, fontWeight: '700' },

    motifInput: { borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 80, textAlignVertical: 'top', fontSize: 14 },

    actions:   { padding: 16, gap: 8, borderTopWidth: StyleSheet.hairlineWidth },
    adminBtns: { flexDirection: 'row', gap: 8 },
    btn:       { borderRadius: 12, paddingVertical: 13, alignItems: 'center', paddingHorizontal: 16 },
    btnFlex:   { flex: 1 },
    btnText:   { color: '#fff', fontWeight: '700', fontSize: 14 },
  });
}
