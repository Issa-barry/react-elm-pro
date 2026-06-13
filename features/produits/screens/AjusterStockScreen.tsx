import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { useAjusterStock } from '../hooks/useAjusterStock';
import { useProduitDetail } from '../hooks/useProduitDetail';
import {
  MOTIFS_AUGMENTATION,
  MOTIFS_DIMINUTION,
  type MotifAjustementStock,
  type MotifOption,
  type Produit,
} from '../types/produit.types';

function formatDisplay(raw: string): string {
  if (!raw) return '';
  const n = parseInt(raw, 10);
  return isNaN(n) ? '' : new Intl.NumberFormat('fr-FR').format(n);
}

function FormattedNumberInput({
  value,
  onChangeText,
  style,
  placeholder,
  placeholderTextColor,
}: {
  value: string;
  onChangeText: (v: string) => void;
  style: object | object[];
  placeholder: string;
  placeholderTextColor: string;
}) {
  return (
    <TextInput
      style={style}
      value={formatDisplay(value)}
      onChangeText={text => onChangeText(text.replace(/\D/g, ''))}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      keyboardType="number-pad"
    />
  );
}

function MotifPicker({
  value,
  options,
  onChange,
  error,
  disabled,
}: {
  value: MotifAjustementStock | '';
  options: MotifOption[];
  onChange: (v: MotifAjustementStock) => void;
  error?: boolean;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label ?? '';

  function handlePress() {
    if (!disabled) setOpen(v => !v);
  }

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.picker,
          {
            backgroundColor: disabled ? colors.surfaceAlt : colors.surface,
            borderColor: error ? colors.danger : open ? colors.primary : colors.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={handlePress}
        activeOpacity={disabled ? 1 : 0.8}
      >
        <Text style={[styles.pickerText, { color: value ? colors.text : colors.textMuted }]}>
          {disabled
            ? 'Saisissez d\'abord une quantité…'
            : selectedLabel || 'Sélectionner un motif…'}
        </Text>
        {!disabled && (
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        )}
      </TouchableOpacity>

      {open && !disabled && (
        <View style={[styles.pickerList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.pickerOption,
                value === opt.value && { backgroundColor: colors.infoBg },
                { borderBottomColor: colors.borderLight },
              ]}
              onPress={() => { onChange(opt.value); setOpen(false); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.pickerOptionText, { color: value === opt.value ? colors.primary : colors.text }]}>
                {opt.label}
              </Text>
              {value === opt.value && <Ionicons name="checkmark" size={16} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && (
        <Text style={[styles.fieldError, { color: colors.danger }]}>Le motif est obligatoire</Text>
      )}
    </View>
  );
}

// Rendered only when produit is ready — no placeholder needed
function AjusterStockFormInner({ produit }: { produit: Produit }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    augmenter, setAugmenter,
    diminuer, setDiminuer,
    motifType, setMotifType,
    motifDetail, setMotifDetail,
    direction,
    submit, loading, error, motifError, motifDetailError,
  } = useAjusterStock(produit);

  const motifOptions = direction === 'augmenter'
    ? MOTIFS_AUGMENTATION
    : direction === 'diminuer'
      ? MOTIFS_DIMINUTION
      : [];

  async function handleSubmit() {
    const ok = await submit();
    if (ok) router.back();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Carte produit */}
        <View style={[styles.produitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.produitLeft}>
            <View style={[styles.produitIconBox, { backgroundColor: colors.primary + '18' }]}>
              <Ionicons name="cube-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.produitInfo}>
              <Text style={[styles.produitNom, { color: colors.text }]} numberOfLines={2}>
                {produit.nom}
              </Text>
              {produit.code_interne ? (
                <Text style={[styles.produitCode, { color: colors.textMuted }]}>{produit.code_interne}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.stockBox}>
            <Text style={[styles.stockLabel, { color: colors.textMuted }]}>Stock actuel</Text>
            <Text style={[styles.stockValue, { color: colors.text }]}>
              {new Intl.NumberFormat('fr-FR').format(produit.qte_stock ?? 0)}
            </Text>
          </View>
        </View>

        {/* Augmenter / Diminuer */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ajustement</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <View style={styles.inputLabel}>
                <Ionicons name="arrow-up" size={15} color={colors.success} />
                <Text style={[styles.labelText, { color: colors.success }]}>Augmenter</Text>
              </View>
              <FormattedNumberInput
                style={[
                  styles.input,
                  {
                    backgroundColor: diminuer ? colors.surfaceAlt : colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    opacity: diminuer ? 0.45 : 1,
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={augmenter}
                onChangeText={setAugmenter}
              />
            </View>

            <View style={styles.col}>
              <View style={styles.inputLabel}>
                <Ionicons name="arrow-down" size={15} color={colors.danger} />
                <Text style={[styles.labelText, { color: colors.danger }]}>Diminuer</Text>
              </View>
              <FormattedNumberInput
                style={[
                  styles.input,
                  {
                    backgroundColor: augmenter ? colors.surfaceAlt : colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    opacity: augmenter ? 0.45 : 1,
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={diminuer}
                onChangeText={setDiminuer}
              />
            </View>
          </View>
        </View>

        {/* Motif — filtré selon la direction */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Motif <Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <MotifPicker
            value={motifType}
            options={motifOptions}
            onChange={setMotifType}
            error={motifError}
            disabled={!direction}
          />

          {motifType === 'autre' && (
            <View style={styles.motifDetailContainer}>
              <Text style={[styles.labelText, { color: colors.text, marginBottom: 6 }]}>
                Préciser <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.motifDetailInput,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: motifDetailError ? colors.danger : colors.border,
                    color: colors.text,
                  },
                ]}
                value={motifDetail}
                onChangeText={setMotifDetail}
                placeholder="Décrire le motif…"
                placeholderTextColor={colors.textMuted}
                maxLength={500}
                multiline
                textAlignVertical="top"
              />
              {motifDetailError && (
                <Text style={[styles.fieldError, { color: colors.danger }]}>Veuillez préciser le motif</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer fixe */}
      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.dangerBg }]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>Valider l'ajustement</Text>
              </>
            )
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Loader: fetches produit then renders the form
function AjusterStockLoader({ produitId }: { produitId: string }) {
  const { colors } = useTheme();
  const { produit, loading, error, reload } = useProduitDetail(produitId);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !produit) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.danger }}>{error ?? 'Produit introuvable'}</Text>
        <TouchableOpacity onPress={reload} style={[styles.retryBtn, { borderColor: colors.border }]}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <AjusterStockFormInner produit={produit} />;
}

export default function AjusterStockScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={[styles.backLabel, { color: colors.primary }]}>Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ajuster le stock</Text>
        <View style={styles.headerRight} />
      </View>

      {id ? (
        <AjusterStockLoader produitId={id} />
      ) : (
        <View style={styles.center}>
          <Text style={{ color: colors.danger }}>Identifiant produit manquant</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn:   { flexDirection: 'row', alignItems: 'center', minWidth: 80, paddingHorizontal: 8, paddingVertical: 4 },
  backLabel:   { fontSize: 16 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  headerRight: { minWidth: 80 },

  center:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },

  scrollContent: { padding: 16, gap: 16, paddingBottom: 24 },

  produitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  produitLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  produitIconBox: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  produitInfo:    { flex: 1 },
  produitNom:     { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  produitCode:    { fontSize: 12, marginTop: 2 },
  stockBox:       { alignItems: 'flex-end' },
  stockLabel:     { fontSize: 11, fontWeight: '500' },
  stockValue:     { fontSize: 26, fontWeight: '800' },

  section: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700' },

  row:        { flexDirection: 'row', gap: 12 },
  col:        { flex: 1, gap: 6 },
  inputLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  labelText:  { fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },

  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pickerText: { fontSize: 14, fontWeight: '500', flex: 1 },
  pickerList: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerOptionText: { fontSize: 14 },
  fieldError:       { fontSize: 12, marginTop: 4 },

  motifDetailContainer: { gap: 4, marginTop: 4 },
  motifDetailInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 80,
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  errorText: { fontSize: 13, flex: 1 },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
