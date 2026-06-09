import { useMemo, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { HeaderBackButton } from '@/shared/components/HeaderBackButton';
import VehiculeDetailScreen from '@/features/vehicule/screens/VehiculeDetailScreen';
import VehiculeFraisScreen from '@/features/vehicule/screens/VehiculeFraisScreen';
import VehiculeCaracteristiquesScreen from '@/features/vehicule/screens/VehiculeCaracteristiquesScreen';
import type { RoleVehicule } from '@/features/vehicule/types/vehicule.types';

function HeaderLeft() { return <HeaderBackButton />; }

type Onglet = 'commissions' | 'frais' | 'caracteristiques';

const ONGLETS: { key: Onglet; label: string }[] = [
  { key: 'commissions',     label: 'Commissions' },
  { key: 'frais',           label: 'Dépenses' },
  { key: 'caracteristiques', label: 'Caractéristiques' },
];

export default function VehiculeDetailRoute() {
  const {
    id, nom, immatriculation,
    vehiculeType, capacite, role, is_active, en_livraison, photo_url,
  } = useLocalSearchParams<{
    id: string;
    nom: string;
    immatriculation: string;
    vehiculeType: string;
    capacite: string;
    role: string;
    is_active: string;
    en_livraison: string;
    photo_url: string;
  }>();

  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [onglet, setOnglet] = useState<Onglet>('commissions');

  const baseProps = { id: id ?? '', nom: nom ?? '', immatriculation: immatriculation ?? '' };
  const caraProps = {
    nom:             nom ?? '',
    immatriculation: immatriculation ?? '',
    type:            vehiculeType ?? '',
    capacite:        Number(capacite ?? '0'),
    role:            (role ?? 'livreur') as RoleVehicule,
    is_active:       is_active === '1',
    en_livraison:    en_livraison === '1',
    photo_url:       photo_url || null,
  };

  return (
    <>
      <Stack.Screen
        options={{
          title:            nom ?? 'Véhicule',
          headerLeft:       HeaderLeft,
          headerBackVisible: false,
          headerStyle:      { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.text },
          headerTintColor:  colors.primary,
        }}
      />

      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarInner}>
          {ONGLETS.map((o) => (
            <TouchableOpacity
              key={o.key}
              style={[styles.tab, onglet === o.key && styles.tabActive]}
              onPress={() => setOnglet(o.key)}
              activeOpacity={0.7}>
              <Text style={[styles.tabLabel, onglet === o.key && styles.tabLabelActive]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {onglet === 'commissions'      && <VehiculeDetailScreen {...baseProps} />}
      {onglet === 'frais'            && <VehiculeFraisScreen {...baseProps} />}
      {onglet === 'caracteristiques' && <VehiculeCaracteristiquesScreen {...caraProps} />}
    </>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    tabBar: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tabBarInner: {
      flexDirection: 'row',
    },
    tab: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textMuted,
    },
    tabLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
}
