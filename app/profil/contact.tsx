import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
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

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { envoyerMessage } from '@/features/contact/services/contact-api.service';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { Colors } from '@/shared/constants/theme';

// Numéro provisoire — à remplacer dès confirmation
const SUPPORT_PHONE = '+224 6XX XX XXxxxx';

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useCurrentUser();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const nomAffiche = user ? `${user.prenom} ${user.nom}`.trim() : '';

  async function handleEnvoyer() {
    if (!message.trim()) return;

    setLoading(true);
    const result = await envoyerMessage(message.trim());
    setLoading(false);

    if (!result.ok) {
      Alert.alert('Erreur', result.error ?? 'Une erreur est survenue.');
      return;
    }

    setMessage('');
    Alert.alert(
      'Message envoyé',
      'Nous avons bien reçu votre message et vous répondrons rapidement.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 20 }}>

          {/* Téléphone */}
          <View style={styles.phoneCard}>
            <View style={[styles.phoneIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="call-outline" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.phoneLabel}>Téléphone support</Text>
              <Text style={styles.phoneValue}>{SUPPORT_PHONE}</Text>
            </View>
          </View>

          {/* Expéditeur (lecture seule) */}
          <View style={styles.senderBox}>
            <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
            <View style={styles.senderText}>
              {!!nomAffiche && <Text style={styles.senderName}>{nomAffiche}</Text>}
              {!!user?.telephone && <Text style={styles.senderPhone}>{user.telephone}</Text>}
            </View>
            <View style={styles.senderBadge}>
              <Text style={styles.senderBadgeText}>Vous</Text>
            </View>
          </View>

          {/* Zone de message */}
          <View>
            <Text style={styles.label}>Votre message</Text>
            <TextInput
              style={styles.textarea}
              value={message}
              onChangeText={setMessage}
              placeholder="Décrivez votre demande ou signalement…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={5000}
            />
            <Text style={styles.charCount}>{message.length} / 5000</Text>
          </View>

          {/* Bouton envoyer */}
          <TouchableOpacity
            style={[styles.sendBtn, (!message.trim() || loading) && styles.sendBtnDisabled]}
            onPress={handleEnvoyer}
            disabled={!message.trim() || loading}>
            <Ionicons name="send" size={16} color="#fff" />
            <Text style={styles.sendBtnText}>{loading ? 'Envoi…' : 'Envoyer le message'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    root:           { flex: 1, backgroundColor: colors.background },
    header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    backBtn:        { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
    headerTitle:    { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
    headerSpacer:   { width: 36 },

    phoneCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
    phoneIcon:  { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    phoneLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
    phoneValue: { fontSize: 16, fontWeight: '700', color: colors.text },

    senderBox:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primaryLight, borderRadius: 12, padding: 12 },
    senderText:     { flex: 1 },
    senderName:     { fontSize: 14, fontWeight: '600', color: colors.primary },
    senderPhone:    { fontSize: 12, color: colors.primary, opacity: 0.8 },
    senderBadge:    { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    senderBadgeText:{ fontSize: 11, fontWeight: '700', color: '#fff' },

    label:          { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 },
    textarea:       { backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, borderRadius: 12, padding: 14, fontSize: 15, color: colors.text, minHeight: 140 },
    charCount:      { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: 4 },

    sendBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15 },
    sendBtnDisabled: { opacity: 0.45 },
    sendBtnText:     { fontSize: 15, fontWeight: '700', color: '#fff' },
  });
}
