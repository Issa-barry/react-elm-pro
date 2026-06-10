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
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>Ajuster le stock</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {produit.nom} — stock actuel : {produit.qte_stock ?? 0}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>Augmenter</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Quantité à ajouter"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={augmenter}
            onChangeText={setAugmenter}
          />

          <Text style={[styles.label, { color: colors.text }]}>Diminuer</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Quantité à retirer"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={diminuer}
            onChangeText={setDiminuer}
          />

          <Text style={[styles.label, { color: colors.text }]}>Motif</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Motif (optionnel)"
            placeholderTextColor={colors.textMuted}
            value={motif}
            onChangeText={setMotif}
          />

          {error ? (
            <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
          ) : null}

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
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>Valider</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  keyboardView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 14,
  },
  error: {
    fontSize: 13,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
