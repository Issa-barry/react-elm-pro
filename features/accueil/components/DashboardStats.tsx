import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { Colors } from '@/shared/constants/theme';

interface StatCard {
  id: string;
  label: string;
  value: string;
  sub?: string;
}

// Données 100% mockées — à remplacer par de vrais appels API
const MOCK_STATS: StatCard[] = [
  { id: '1', label: 'Commandes du jour',   value: '24',        sub: '+3 depuis hier' },
  { id: '2', label: "Chiffre d'affaires",  value: '182 500 GF', sub: 'Aujourd\'hui' },
  { id: '3', label: 'Livraisons en cours', value: '8',          sub: 'En route' },
  { id: '4', label: 'Clients actifs',      value: '143',        sub: 'Ce mois-ci' },
];

function StatCard({ card }: Readonly<{ card: StatCard }>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{card.value}</Text>
      <Text style={styles.label}>{card.label}</Text>
      {card.sub ? <Text style={styles.sub}>{card.sub}</Text> : null}
    </View>
  );
}

export default function DashboardStats() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Tableau de bord</Text>
      <View style={styles.grid}>
        {MOCK_STATS.map(card => (
          <StatCard key={card.id} card={card} />
        ))}
      </View>
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { paddingHorizontal: 24, gap: 12 },
    titre:     { fontSize: 17, fontWeight: '700', color: colors.text },
    grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 4,
    },
    value: { fontSize: 22, fontWeight: '700', color: colors.primary },
    label: { fontSize: 13, fontWeight: '500', color: colors.text },
    sub:   { fontSize: 11, color: colors.textMuted },
  });
}
