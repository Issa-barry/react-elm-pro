import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { IconSymbol } from '@/shared/components/ui/icon-symbol';
import { Colors } from '@/shared/constants/theme';

interface GridItem {
  id:    string;
  label: string;
  icon:  Parameters<typeof IconSymbol>[0]['name'];
  route: string;
}

const ITEMS: GridItem[] = [
  { id: 'ventes',       label: 'Ventes',        icon: 'cart.fill',             route: '/ventes' },
  { id: 'clients',      label: 'Clients',        icon: 'person.2.fill',         route: '/clients' },
  { id: 'vehicules',    label: 'Véhicules',      icon: 'car.fill',              route: '/vehicules' },
  { id: 'produits',     label: 'Produits',       icon: 'cube.fill',             route: '/produits' },
  { id: 'logistique',   label: 'Logistique',     icon: 'shippingbox.fill',      route: '/logistique' },
  { id: 'sites',        label: 'Sites',          icon: 'mappin.and.ellipse',    route: '/sites' },
  { id: 'utilisateurs', label: 'Utilisateurs',   icon: 'person.3.fill',         route: '/utilisateurs' },
];

export default function BusinessGrid() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Accès rapide</Text>
      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.cell}
            activeOpacity={0.7}
            onPress={() => router.push(item.route as never)}
            accessibilityLabel={item.label}>
            <View style={styles.iconBox}>
              <IconSymbol name={item.icon} size={22} color={colors.primary} />
            </View>
            <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    wrapper:      { paddingHorizontal: 24, gap: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    cell: {
      width: '30%',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 14,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
  });
}
