import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAjusterStock } from '../hooks/useAjusterStock';
import type { Produit } from '../types/produit.types';

interface AjusterStockModalProps {
  visible: boolean;
  onClose: () => void;
  produit: Produit;
  onSuccess: () => void;
}

export default function AjusterStockModal({
  visible,
  onClose,
  produit,
  onSuccess,
}: AjusterStockModalProps) {
  const { colors } = useTheme();
  const {
    augmenter, setAugmenter,
    diminuer, setDiminuer,
    motif, setMotif,
    submit, loading, error,
  } = useAjusterStock(produit);

  async function handleSubmit() {
    const ok = await submit();
    if (ok) {
      onSuccess();
      onClose();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>

          {/* Barre de drag */}
          <View style={[styles.dragBar, { backgroundColor: colors.border }]} />

          {/* Titre */}
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Ajuster le stock</Text>

          {/* Carte produit */}
          <View style={[styles.produitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.produitLeft}>
              <View style={[styles.produitIconBox, { backgroundColor: colors.primary + '18' }]}>
                <Ionicons name="cube-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.produitInfo}>
                <Text style={[styles.produitNom, { color: colors.text }]} numberOfLines={1}>
                  {produit.nom}
                </Text>
                {produit.code_interne ? (
                  <Text style={[styles.produitCode, { color: colors.textMuted }]}>
                    {produit.code_interne}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.stockBox}>
              <Text style={[styles.stockLabel, { color: colors.textMuted }]}>Stock actuel</Text>
              <Text style={[styles.stockValue, { color: colors.text }]}>
                {produit.qte_stock ?? 0}
              </Text>
            </View>
          </View>

          {/* Augmenter / Diminuer côte à côte */}
          <View style={styles.row}>
            <View style={styles.col}>
              <View style={styles.inputLabel}>
                <Ionicons name="arrow-up" size={15} color={colors.success} />
                <Text style={[styles.labelText, { color: colors.success }]}>Augmenter</Text>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={augmenter}
                onChangeText={setAugmenter}
              />
            </View>

            <View style={styles.col}>
              <View style={styles.inputLabel}>
                <Ionicons name="arrow-down" size={15} color={colors.danger} />
                <Text style={[styles.labelText, { color: colors.danger }]}>Diminuer</Text>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={diminuer}
                onChangeText={setDiminuer}
              />
            </View>
          </View>

          {/* Motif */}
          <View style={styles.motifContainer}>
            <Text style={[styles.labelText, { color: colors.text }]}>
              Motif <Text style={{ color: colors.textMuted, fontWeight: '400' }}>(optionnel)</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.motifInput,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="Ex : inventaire, correction, retour..."
              placeholderTextColor={colors.textMuted}
              value={motif}
              onChangeText={setMotif}
            />
          </View>

          {error ? (
            <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
          ) : null}

          {/* Boutons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.submitText}>Valider</Text>
              }
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  keyboardView:{ position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  dragBar: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 4,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700' },

  // Carte produit
  produitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
  },
  produitLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  produitIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  produitInfo:    { flex: 1 },
  produitNom:     { fontSize: 14, fontWeight: '700' },
  produitCode:    { fontSize: 12, marginTop: 2 },
  stockBox:       { alignItems: 'flex-end' },
  stockLabel:     { fontSize: 11, fontWeight: '500' },
  stockValue:     { fontSize: 22, fontWeight: '800' },

  // Inputs
  row:      { flexDirection: 'row', gap: 12 },
  col:      { flex: 1, gap: 6 },
  inputLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  labelText:  { fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  motifContainer: { gap: 6 },
  motifInput:     {},

  error: { fontSize: 13 },

  buttons:    { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn:  { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600' },
  submitBtn:  { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
