/* eslint-disable react/no-unescaped-entities */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/contexts/ThemeContext';
import type { Colors } from '@/shared/constants/theme';

export default function ConditionsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 32 }}>

        <Text style={styles.updated}>Dernière mise à jour : juin 2025</Text>

        <Section title="1. Responsable du traitement" styles={styles}>
          Eau la maman, société de distribution d'eau potable, dont le siège social est situé en Guinée, est le responsable du traitement de vos données personnelles au sens du Règlement Général sur la Protection des Données (RGPD).
        </Section>

        <Section title="2. Données collectées" styles={styles}>
          Nous collectons les données suivantes lors de votre inscription et utilisation de l'application :{'\n\n'}
          • Nom, prénom{'\n'}
          • Numéro de téléphone{'\n'}
          • Adresse e-mail{'\n'}
          • Données de géolocalisation (pour les opérations de terrain){'\n'}
          • Données de connexion et d'utilisation (logs, horodatages){'\n\n'}
          Ces données sont nécessaires à l'exécution du contrat de service entre vous et Eau la maman.
        </Section>

        <Section title="3. Finalités du traitement" styles={styles}>
          Vos données sont utilisées pour :{'\n\n'}
          • Gérer votre compte et authentifier votre accès{'\n'}
          • Coordonner la logistique et les opérations back-office{'\n'}
          • Vous envoyer des notifications relatives à votre activité{'\n'}
          • Améliorer nos services
        </Section>

        <Section title="4. Conservation des données" styles={styles}>
          Vos données sont conservées pendant toute la durée de votre relation contractuelle avec Eau la maman, puis archivées pour une durée de 5 ans conformément aux obligations légales applicables.
        </Section>

        <Section title="5. Vos droits" styles={styles}>
          Conformément à la réglementation applicable, vous disposez des droits suivants :{'\n\n'}
          • Droit d'accès à vos données{'\n'}
          • Droit de rectification{'\n'}
          • Droit à l'effacement (droit à l'oubli){'\n'}
          • Droit à la portabilité{'\n'}
          • Droit d'opposition au traitement{'\n\n'}
          Pour exercer ces droits, contactez-nous à : contact@eaulamaman.com
        </Section>

        <Section title="6. Sécurité" styles={styles}>
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation. Les mots de passe sont chiffrés et ne sont jamais stockés en clair.
        </Section>

        <Section title="7. Notifications push" styles={styles}>
          Avec votre accord, nous envoyons des notifications push sur votre appareil pour vous informer des événements opérationnels. Vous pouvez désactiver ces notifications à tout moment dans les paramètres de l'application ou de votre appareil.
        </Section>

        <Section title="8. Modifications" styles={styles}>
          Eau la maman se réserve le droit de modifier les présentes conditions à tout moment. Vous serez informé de toute modification significative via l'application. La poursuite de l'utilisation des services après modification vaut acceptation des nouvelles conditions.
        </Section>

        <Text style={styles.footer}>© 2025 Eau la maman. Tous droits réservés.</Text>
      </ScrollView>
    </View>
  );
}

function Section({ title, children, styles }: { title: string; children: React.ReactNode; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    root:         { flex: 1, backgroundColor: colors.background },
    header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    backBtn:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
    headerTitle:  { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
    headerSpacer: { width: 36 },
    updated:      { fontSize: 12, color: colors.textMuted, marginBottom: 20 },
    section:      { marginBottom: 20 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
    sectionBody:  { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
    footer:       { marginTop: 8, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  });
}
