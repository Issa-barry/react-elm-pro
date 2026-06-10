import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import type { Produit } from '../types/produit.types';
import { useProduitDetail } from '../hooks/useProduitDetail';
import { useProduitForm } from '../hooks/useProduitForm';

const TYPE_OPTIONS = [
  { value: 'materiel', label: 'Matériel' },
  { value: 'service', label: 'Service' },
  { value: 'fabricable', label: 'Fabricable' },
  { value: 'achat_vente', label: 'Achat/Vente' },
];

const STATUT_OPTIONS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'archive', label: 'Archivé' },
];

function SegmentedPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={fieldStyles.container}>
      <Text style={[fieldStyles.label, { color: colors.text }]}>{label}</Text>
      <View style={fieldStyles.segmentRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[
              fieldStyles.segment,
              {
                backgroundColor: value === opt.value ? colors.primary : colors.surfaceAlt,
                borderColor: colors.border,
              },
            ]}
            onPress={() => onChange(opt.value)}
          >
            <Text
              style={[
                fieldStyles.segmentText,
                { color: value === opt.value ? '#fff' : colors.textMuted },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container:    { marginBottom: 16 },
  label:        { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  segmentRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  segmentText:  { fontSize: 12, fontWeight: '600' },
});

type ImageAsset = { uri: string; name: string; type: string };

async function pickImage(source: 'gallery' | 'camera'): Promise<ImageAsset | null> {
  if (source === 'gallery') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la galerie dans les réglages.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return null;
    const a = result.assets[0];
    return { uri: a.uri, name: a.fileName ?? 'photo.jpg', type: a.mimeType ?? 'image/jpeg' };
  } else {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la caméra dans les réglages.');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return null;
    const a = result.assets[0];
    return { uri: a.uri, name: a.fileName ?? 'photo.jpg', type: a.mimeType ?? 'image/jpeg' };
  }
}

function ImagePickerSection({
  existingUrl,
  localImage,
  onPick,
  onClear,
}: {
  existingUrl: string | null;
  localImage: ImageAsset | null | undefined;
  onPick: (img: ImageAsset) => void;
  onClear: () => void;
}) {
  const { colors } = useTheme();
  const displayUri = localImage?.uri ?? existingUrl;

  async function handlePick(source: 'gallery' | 'camera') {
    const img = await pickImage(source);
    if (img) onPick(img);
  }

  return (
    <View style={fieldStyles.container}>
      <Text style={[fieldStyles.label, { color: colors.text }]}>Photo</Text>
      {displayUri ? (
        <View style={[imgStyles.previewWrapper, { backgroundColor: colors.surfaceAlt }]}>
          <Image source={{ uri: displayUri }} style={imgStyles.preview} contentFit="contain" />
          {localImage && (
            <TouchableOpacity style={imgStyles.clearBtn} onPress={onClear}>
              <Ionicons name="close-circle" size={26} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={[imgStyles.placeholder, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Ionicons name="image-outline" size={40} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>Aucune photo</Text>
        </View>
      )}
      <View style={imgStyles.btnRow}>
        <TouchableOpacity
          style={[imgStyles.pickBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => handlePick('gallery')}
        >
          <Ionicons name="images-outline" size={18} color={colors.text} />
          <Text style={[imgStyles.pickBtnText, { color: colors.text }]}>Galerie</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[imgStyles.pickBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => handlePick('camera')}
        >
          <Ionicons name="camera-outline" size={18} color={colors.text} />
          <Text style={[imgStyles.pickBtnText, { color: colors.text }]}>Appareil photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const imgStyles = StyleSheet.create({
  previewWrapper: { width: '100%', height: 260, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  preview:        { width: '100%', height: 260 },
  placeholder: { height: 160, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  clearBtn:    { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 14, padding: 1 },
  btnRow:      { flexDirection: 'row', gap: 10, marginTop: 10 },
  pickBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  pickBtnText: { fontSize: 13, fontWeight: '600' },
});

// Inner form component that uses the hook once produit is ready (or null for create)
function FormContent({ produitId }: { produitId: string | null }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { produit, loading: loadingProduit } = useProduitDetail(produitId ?? '');

  // Provide the produit only when it's loaded (for edit). For create, pass null.
  const shouldLoad = produitId != null;
  const resolvedProduit: Produit | null = shouldLoad ? produit : null;

  const { form, setField, submit, loading, globalError } = useProduitForm(
    shouldLoad ? resolvedProduit : null
  );

  const isEdit = !!produitId;

  async function handleSubmit() {
    const result = await submit();
    if (result.ok) {
      router.back();
    }
  }

  if (shouldLoad && loadingProduit && !produit) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {globalError ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.dangerBg }]}>
            <Text style={{ color: colors.danger, fontSize: 13 }}>{globalError}</Text>
          </View>
        ) : null}

        {/* Nom */}
        <View style={fieldStyles.container}>
          <Text style={[fieldStyles.label, { color: colors.text }]}>Nom *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Nom du produit"
            placeholderTextColor={colors.textMuted}
            value={form.nom}
            onChangeText={v => setField('nom', v)}
          />
        </View>

        {/* Code fournisseur */}
        <View style={fieldStyles.container}>
          <Text style={[fieldStyles.label, { color: colors.text }]}>Code fournisseur</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Code fournisseur"
            placeholderTextColor={colors.textMuted}
            value={form.code_fournisseur}
            onChangeText={v => setField('code_fournisseur', v)}
          />
        </View>

        {/* Photo */}
        <ImagePickerSection
          existingUrl={resolvedProduit?.image_url ?? null}
          localImage={form.image ?? null}
          onPick={img => setField('image', img)}
          onClear={() => setField('image', null)}
        />

        {/* Type */}
        <SegmentedPicker
          label="Type"
          options={TYPE_OPTIONS}
          value={form.type}
          onChange={v => setField('type', v)}
        />

        {/* Statut */}
        <SegmentedPicker
          label="Statut"
          options={STATUT_OPTIONS}
          value={form.statut}
          onChange={v => setField('statut', v)}
        />

        {/* Prix vente */}
        <View style={fieldStyles.container}>
          <Text style={[fieldStyles.label, { color: colors.text }]}>Prix de vente (GNF)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.prix_vente}
            onChangeText={v => setField('prix_vente', v)}
          />
        </View>

        {/* Prix achat */}
        <View style={fieldStyles.container}>
          <Text style={[fieldStyles.label, { color: colors.text }]}>Prix d'achat (GNF)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.prix_achat}
            onChangeText={v => setField('prix_achat', v)}
          />
        </View>

        {/* Prix usine */}
        <View style={fieldStyles.container}>
          <Text style={[fieldStyles.label, { color: colors.text }]}>Prix usine (GNF)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.prix_usine}
            onChangeText={v => setField('prix_usine', v)}
          />
        </View>

        {/* Coût */}
        <View style={fieldStyles.container}>
          <Text style={[fieldStyles.label, { color: colors.text }]}>Coût (GNF)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.cout}
            onChangeText={v => setField('cout', v)}
          />
        </View>

        {/* Stock */}
        <View style={fieldStyles.container}>
          <Text style={[fieldStyles.label, { color: colors.text }]}>Quantité en stock</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.qte_stock}
            onChangeText={v => setField('qte_stock', v)}
          />
        </View>

        {/* Seuil alerte */}
        <View style={fieldStyles.container}>
          <Text style={[fieldStyles.label, { color: colors.text }]}>Seuil d'alerte stock</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.seuil_alerte_stock}
            onChangeText={v => setField('seuil_alerte_stock', v)}
          />
        </View>

        {/* Description */}
        <View style={fieldStyles.container}>
          <Text style={[fieldStyles.label, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textarea,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Description du produit"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={v => setField('description', v)}
          />
        </View>

        {/* En alerte */}
        <View style={[styles.switchRow, { borderColor: colors.border }]}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>Produit en alerte</Text>
          <Switch
            value={form.is_alerte}
            onValueChange={v => setField('is_alerte', v)}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={form.is_alerte ? colors.primary : colors.textMuted}
          />
        </View>

        {/* Bouton soumettre */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{isEdit ? 'Enregistrer les modifications' : 'Créer le produit'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ProduitFormScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const produitId = params.id ?? null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FormContent produitId={produitId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input:        {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textarea:     { minHeight: 90, textAlignVertical: 'top' },
  switchRow:    {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  switchLabel:  { fontSize: 14, fontWeight: '600' },
  submitBtn:    {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  errorBanner:  { borderRadius: 8, padding: 12, marginBottom: 16 },
});
