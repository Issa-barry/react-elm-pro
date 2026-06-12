import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';

import { EmptyState }    from '../ui/EmptyState';
import { SectionHeader } from '../ui/SectionHeader';
import { StatCard }      from '../ui/StatCard';
import { StatusBadge }   from '../ui/StatusBadge';

import {
  LOGISTICS_STATS,
  TRANSFER_STATUS_LABELS,
  TRANSFERS,
  type Transfer,
  type TransferStatus,
} from '../../mocks/logistics.mock';

// ─── Badge variant par statut ─────────────────────────────────────────────────

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

const STATUS_VARIANT: Record<TransferStatus, BadgeVariant> = {
  en_chargement: 'warning',
  en_transit:    'primary',
  en_cours:      'primary',
  receptionne:   'success',
};

// ─── Ligne transfert ──────────────────────────────────────────────────────────

function TransferRow({ transfer }: Readonly<{ transfer: Transfer }>) {
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="swap-horizontal-outline" size={16} color={colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.reference} numberOfLines={1}>{transfer.reference}</Text>
          <StatusBadge
            label={TRANSFER_STATUS_LABELS[transfer.statut]}
            variant={STATUS_VARIANT[transfer.statut]}
          />
        </View>
        <View style={styles.routeRow}>
          <Text style={styles.place} numberOfLines={1}>{transfer.origine}</Text>
          <Ionicons name="arrow-forward" size={12} color={colors.textLight} />
          <Text style={styles.place} numberOfLines={1}>{transfer.destination}</Text>
        </View>
        <Text style={styles.meta}>
          {transfer.vehicule} · {transfer.nbProduits} produit{transfer.nbProduits > 1 ? 's' : ''} · {transfer.date}
        </Text>
      </View>
    </View>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  bottomInset: number;
}

export default function LogisticsDashboardTab({ bottomInset }: Props) {
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Statistiques */}
      <View style={styles.statsGrid}>
        {LOGISTICS_STATS.map(stat => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </View>

      {/* Derniers transferts */}
      <View style={styles.section}>
        <SectionHeader title="Derniers transferts" />
        <View style={styles.card}>
          {TRANSFERS.length === 0
            ? <EmptyState icon="cube-outline" title="Aucun transfert" subtitle="Aucun transfert en cours" />
            : TRANSFERS.map((transfer, i) => (
                <View key={transfer.id}>
                  <TransferRow transfer={transfer} />
                  {i < TRANSFERS.length - 1 && <View style={styles.divider} />}
                </View>
              ))
          }
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    scroll:   { flex: 1, backgroundColor: colors.background },
    content:  { paddingHorizontal: 16, paddingTop: 12, gap: 16 },

    statsGrid: {
      flexDirection: 'row',
      flexWrap:      'wrap',
      gap:           10,
    },

    section: { gap: 10 },

    card: {
      backgroundColor: colors.surface,
      borderRadius:    14,
      borderWidth:     1,
      borderColor:     colors.border,
      paddingVertical: 4,
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 1 },
      shadowOpacity:   0.05,
      shadowRadius:    4,
      elevation:       1,
    },

    row: {
      flexDirection:     'row',
      alignItems:        'flex-start',
      paddingVertical:   12,
      paddingHorizontal: 14,
      gap:               10,
    },
    iconBox: {
      width:          32,
      height:         32,
      borderRadius:   10,
      alignItems:     'center',
      justifyContent: 'center',
      marginTop:      2,
    },
    rowBody:    { flex: 1, gap: 4 },
    rowTop:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    reference:  { fontSize: 13, fontWeight: '700', color: colors.text, flex: 1 },
    routeRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
    place:      { fontSize: 12, color: colors.textMuted, flex: 1 },
    meta:       { fontSize: 11, color: colors.textLight },

    divider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 14 },
  });
}
