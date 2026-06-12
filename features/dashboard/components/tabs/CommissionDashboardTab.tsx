import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { formatMontant } from '@/shared/utils/format';

import { EmptyState }    from '../ui/EmptyState';
import { SectionHeader } from '../ui/SectionHeader';
import { StatCard }      from '../ui/StatCard';
import { StatusBadge }   from '../ui/StatusBadge';

import {
  COMMISSION_STATUS_LABELS,
  COMMISSION_STATS,
  COMMISSIONS,
  type Commission,
  type CommissionStatus,
} from '../../mocks/commission.mock';

// ─── Badge variant par statut ─────────────────────────────────────────────────

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

const STATUS_VARIANT: Record<CommissionStatus, BadgeVariant> = {
  en_attente: 'warning',
  payee:      'success',
  annulee:    'muted',
};

// ─── Ligne commission ─────────────────────────────────────────────────────────

function CommissionRow({ commission }: Readonly<{ commission: Commission }>) {
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="person-outline" size={16} color={colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.agent} numberOfLines={1}>{commission.agent}</Text>
          <StatusBadge
            label={COMMISSION_STATUS_LABELS[commission.statut]}
            variant={STATUS_VARIANT[commission.statut]}
          />
        </View>
        <Text style={styles.montant}>{formatMontant(commission.montant)}</Text>
        <Text style={styles.meta}>
          {commission.type} · {commission.periode} · {commission.date}
        </Text>
      </View>
    </View>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  bottomInset: number;
}

export default function CommissionDashboardTab({ bottomInset }: Props) {
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
        {COMMISSION_STATS.map(stat => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </View>

      {/* Dernières commissions */}
      <View style={styles.section}>
        <SectionHeader title="Dernières commissions" />
        <View style={styles.card}>
          {COMMISSIONS.length === 0
            ? <EmptyState icon="cash-outline" title="Aucune commission" subtitle="Aucune commission enregistrée" />
            : COMMISSIONS.map((commission, i) => (
                <View key={commission.id}>
                  <CommissionRow commission={commission} />
                  {i < COMMISSIONS.length - 1 && <View style={styles.divider} />}
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
    avatar: {
      width:          32,
      height:         32,
      borderRadius:   10,
      alignItems:     'center',
      justifyContent: 'center',
      marginTop:      2,
    },
    rowBody:  { flex: 1, gap: 4 },
    rowTop:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    agent:    { fontSize: 13, fontWeight: '700', color: colors.text, flex: 1 },
    montant:  { fontSize: 15, fontWeight: '800', color: colors.primary },
    meta:     { fontSize: 11, color: colors.textLight },

    divider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 14 },
  });
}
