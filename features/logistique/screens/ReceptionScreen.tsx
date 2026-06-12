import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import { EcartSelector } from '../components/EcartSelector';
import { useTransfertDetail } from '../hooks/useTransfertDetail';
import { saisirReception, validerReception } from '../services/logistique-api.service';
import type { TransfertLigne, TypeEcart } from '../types/logistique.types';

interface LigneState {
  quantite_recue: string;
  ecart_type: TypeEcart | null;
  ecart_motif: string;
}

function formatNum(val: number | null | undefined): string {
  if (val == null) return '—';
  return new Intl.NumberFormat('fr-FR').format(val);
}

export default function ReceptionScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transfert, loading, error, load } = useTransfertDetail(id ?? '');
  const [lignesState, setLignesState] = useState<Record<string, LigneState>>({});
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (transfert) {
      const init: Record<string, LigneState> = {};
      transfert.lignes.forEach(l => {
        init[l.id] = {
          quantite_recue: l.quantite_recue != null ? String(l.quantite_recue) : '',
          ecart_type: l.ecart_type ?? null,
          ecart_motif: l.ecart_motif ?? '',
        };
      });
      setLignesState(init);
    }
  }, [transfert]);

  const updateLigne = useCallback((id: string, field: keyof LigneState, value: unknown) => {
    setLignesState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }, []);

  const allFilled = useMemo(() => {
    if (!transfert || transfert.lignes.length === 0) return false;
    return transfert.lignes.every(l => {
      const s = lignesState[l.id];
      if (!s) return false;
      const qty = s.quantite_recue.trim();
      return qty !== '' && /^\d+$/.test(qty) && s.ecart_type !== null;
    });
  }, [transfert, lignesState]);

  const handleSaisir = useCallback(async () => {
    if (!transfert || !allFilled) return;
    setSaving(true);
    const lignes = transfert.lignes.map((l: TransfertLigne) => ({
      id: l.id,
      quantite_recue: Number(lignesState[l.id]?.quantite_recue ?? '0'),
      ecart_type: lignesState[l.id]?.ecart_type ?? 'conforme',
      ecart_motif: lignesState[l.id]?.ecart_motif || undefined,
    }));
    const result = await saisirReception(id ?? '', lignes);
    setSaving(false);
    if (result.ok) {
      setSaved(true);
    } else {
      Alert.alert('Erreur', result.error);
    }
  }, [transfert, lignesState, allFilled, id]);

  const handleValider = useCallback(() => {
    Alert.alert(
      'Valider la réception',
      'Confirmer la réception ? Le stock du site de destination sera mis à jour.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: async () => {
            setValidating(true);
            const result = await validerReception(id ?? '');
            setValidating(false);
            if (result.ok) {
              router.back();
            } else {
              Alert.alert('Erreur', result.error);
            }
          },
        },
      ]
    );
  }, [id]);

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
          <Text style={{ color: colors.danger }}>{error ?? 'Erreur.'}</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.primary }]}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Saisie réception</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {transfert.reference} · {transfert.site_source.nom} → {transfert.site_destination.nom}
        </Text>

        {transfert.lignes.map((ligne: TransfertLigne) => {
          const ls = lignesState[ligne.id];
          if (!ls) return null;
          return (
            <View key={ligne.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.produitNom, { color: colors.text }]} numberOfLines={2}>
                {ligne.produit_nom ?? 'Produit'}
              </Text>
              <Text style={[styles.reference, { color: colors.textMuted }]}>
                Chargé : {formatNum(ligne.quantite_chargee ?? ligne.quantite_demandee)}
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Quantité reçue</Text>
              <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={ls.quantite_recue}
                  onChangeText={v => updateLigne(ligne.id, 'quantite_recue', v.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  maxLength={6}
                />
              </View>

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Type d'écart</Text>
              <EcartSelector
                value={ls.ecart_type}
                onChange={v => updateLigne(ligne.id, 'ecart_type', v)}
              />

              {ls.ecart_type && ls.ecart_type !== 'conforme' && (
                <>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Motif (optionnel)</Text>
                  <TextInput
                    style={[styles.motifInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                    value={ls.ecart_motif}
                    onChangeText={v => updateLigne(ligne.id, 'ecart_motif', v)}
                    placeholder="Expliquer l'écart..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={2}
                    maxLength={500}
                  />
                </>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        {!saved ? (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, opacity: !allFilled || saving ? 0.5 : 1 }]}
            onPress={handleSaisir}
            disabled={!allFilled || saving}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>
              {saving ? 'Enregistrement…' : 'Enregistrer la réception'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.success, opacity: validating ? 0.5 : 1 }]}
            onPress={handleValider}
            disabled={validating}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>
              {validating ? 'En cours…' : 'Valider la réception'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    root:    { flex: 1, backgroundColor: colors.background },
    scroll:  { flex: 1 },
    content: { padding: 16, gap: 12 },
    center:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
    backBtn: { minWidth: 60 },
    backLabel: { fontSize: 17 },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
    headerSpacer: { minWidth: 60 },

    subtitle:   { fontSize: 13, marginBottom: 4 },

    card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10 },
    produitNom: { fontSize: 15, fontWeight: '600' },
    reference:  { fontSize: 12 },
    fieldLabel: { fontSize: 12, fontWeight: '600' },

    inputWrap: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    input:     { fontSize: 16, fontWeight: '700', textAlign: 'left' },

    motifInput: { borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 60, textAlignVertical: 'top', fontSize: 13 },

    footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
    btn:    { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  });
}
