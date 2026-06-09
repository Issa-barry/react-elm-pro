import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { formatMontant } from '@/shared/utils/format';
import type { GainsParVehicule } from '@/features/gains/types/gains.types';

interface Props {
  parVehicule: GainsParVehicule[];
  loading: boolean;
  error: string | null;
}

function VehiculeRow({ item, isLast }: Readonly<{ item: GainsParVehicule; isLast: boolean }>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  function handlePress() {
    router.push({
      pathname: `/vehicule/${item.vehicule_id}`,
      params: { nom: item.nom, immatriculation: item.immatriculation },
    });
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress} style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <Text style={styles.nom}>{item.nom}</Text>
        <Text style={styles.immat}>{item.immatriculation}</Text>
        <View style={styles.montantsRow}>
          <Text style={styles.montantLabel}>Net</Text>
          <Text style={styles.montantValeur}>{formatMontant(item.total_net)}</Text>
          {item.total_restant > 0 && (
            <>
              <Text style={styles.montantSep}>·</Text>
              <Text style={styles.montantLabel}>Restant</Text>
              <Text style={[styles.montantValeur, styles.montantRestant]}>
                {formatMontant(item.total_restant)}
              </Text>
            </>
          )}
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function SoldeVehicules({ parVehicule, loading, error }: Readonly<Props>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const renderBody = () => {
    if (loading) {
      return <View style={styles.centerBox}><ActivityIndicator size="small" color={colors.primary} /></View>;
    }
    if (error) {
      return <View style={styles.centerBox}><Text style={styles.errorText}>Impossible de charger les données.</Text></View>;
    }
    if (parVehicule.length === 0) {
      return <View style={styles.centerBox}><Text style={styles.emptyText}>Aucun véhicule rattaché.</Text></View>;
    }
    return parVehicule.map((item, index) => (
      <VehiculeRow key={item.vehicule_id} item={item} isLast={index === parVehicule.length - 1} />
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Solde par véhicule</Text>
      <View style={styles.card}>{renderBody()}</View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container:  { paddingHorizontal: 24, gap: 12 },
    titre:      { fontSize: 17, fontWeight: '700', color: colors.text },
    card:       { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', minHeight: 60 },
    row:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    rowBorder:  { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    rowLeft:    { flex: 1, gap: 3 },
    nom:        { fontSize: 15, fontWeight: '600', color: colors.text },
    immat:      { fontSize: 12, color: colors.textMuted },
    montantsRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    montantLabel:  { fontSize: 12, color: colors.textMuted },
    montantValeur: { fontSize: 13, fontWeight: '600', color: colors.text },
    montantSep:    { fontSize: 12, color: colors.textLight },
    montantRestant:{ color: colors.warning },
    chevron:    { fontSize: 22, color: colors.textLight, marginLeft: 8 },
    centerBox:  { paddingVertical: 20, alignItems: 'center' },
    emptyText:  { fontSize: 13, color: colors.textMuted },
    errorText:  { fontSize: 13, color: colors.danger },
  });
}
