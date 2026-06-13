import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { AdjustmentConfirmModal } from '../components/adjustment/AdjustmentConfirmModal';
import { AdjustmentQuantityInput } from '../components/adjustment/AdjustmentQuantityInput';
import { AdjustmentReasonSelector } from '../components/adjustment/AdjustmentReasonSelector';
import { AdjustmentTypeSelector } from '../components/adjustment/AdjustmentTypeSelector';
import { StockAdjustmentHeader } from '../components/adjustment/StockAdjustmentHeader';
import { StockPreviewCard } from '../components/adjustment/StockPreviewCard';
import { useAjusterStock } from '../hooks/useAjusterStock';
import { useProduitDetail } from '../hooks/useProduitDetail';
import type { Produit } from '../types/produit.types';

function AjusterStockFormInner({ produit }: { produit: Produit }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const {
    direction, setDirection,
    quantite, setQuantite,
    motifType, setMotifType,
    stockPreview,
    submit, loading, error,
    motifError, quantiteError,
  } = useAjusterStock(produit);

  const stockActuel = produit.qte_stock ?? 0;

  const canOpenConfirm = !!direction && !!quantite && parseInt(quantite, 10) > 0 && !!motifType;

  const handlePressValider = useCallback(() => {
    if (canOpenConfirm) {
      setConfirmVisible(true);
    } else {
      submit();
    }
  }, [canOpenConfirm, submit]);

  const handleConfirm = useCallback(async () => {
    const ok = await submit();
    if (ok) router.back();
  }, [submit]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StockAdjustmentHeader produit={produit} />

          <AdjustmentTypeSelector value={direction} onChange={setDirection} />

          <AdjustmentQuantityInput
            direction={direction}
            value={quantite}
            onChange={setQuantite}
            error={quantiteError}
          />

          <AdjustmentReasonSelector
            direction={direction}
            value={motifType}
            onChange={setMotifType}
            error={motifError}
          />

          <StockPreviewCard
            direction={direction}
            stockActuel={stockActuel}
            stockApres={stockPreview}
          />
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerBg }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: colors.primary },
              !direction && styles.submitBtnDisabled,
            ]}
            onPress={handlePressValider}
            disabled={loading || !direction}
            activeOpacity={0.85}
            accessibilityLabel="Valider l'ajustement"
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>Valider l'ajustement</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <AdjustmentConfirmModal
        visible={confirmVisible}
        direction={direction}
        quantite={quantite}
        motifType={motifType}
        stockActuel={stockActuel}
        stockApres={stockPreview}
        loading={loading}
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmVisible(false)}
      />
    </>
  );
}

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
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
