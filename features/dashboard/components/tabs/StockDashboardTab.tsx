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
  MOUVEMENTS_STOCK,
  STOCK_ALERTS,
  STOCK_STATS,
  type MouvementStock,
  type StockAlert,
} from '../../mocks/stock.mock';

// ─── Alerte stock ─────────────────────────────────────────────────────────────

function AlertRow({ alert }: Readonly<{ alert: StockAlert }>) {
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle} numberOfLines={1}>{alert.produit}</Text>
        <Text style={styles.rowSub}>{alert.code}</Text>
        <Text style={styles.rowSub}>
          Stock : <Text style={{ fontWeight: '700' }}>{alert.qte}</Text> / seuil {alert.seuil}
        </Text>
      </View>
      <StatusBadge
        label={alert.type === 'rupture' ? 'Rupture' : 'Faible'}
        variant={alert.type === 'rupture' ? 'danger' : 'warning'}
      />
    </View>
  );
}

// ─── Mouvement ────────────────────────────────────────────────────────────────

function MouvementRow({ mvt }: Readonly<{ mvt: MouvementStock }>) {
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);
  const isEntree   = mvt.type === 'entree';

  return (
    <View style={styles.row}>
      <View style={[styles.mvtIcon, { backgroundColor: isEntree ? colors.successBg : colors.dangerBg }]}>
        <Ionicons
          name={isEntree ? 'arrow-down-outline' : 'arrow-up-outline'}
          size={16}
          color={isEntree ? colors.success : colors.danger}
        />
      </View>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle} numberOfLines={1}>{mvt.produit}</Text>
        <Text style={styles.rowSub}>{mvt.motif} · {mvt.date}</Text>
      </View>
      <Text style={[styles.mvtQte, { color: isEntree ? colors.success : colors.danger }]}>
        {isEntree ? '+' : '−'}{mvt.quantite}
      </Text>
    </View>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  bottomInset: number;
}

export default function StockDashboardTab({ bottomInset }: Props) {
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
        {STOCK_STATS.map(stat => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </View>

      {/* Alertes stock */}
      <View style={styles.section}>
        <SectionHeader title="Alertes stock" />
        <View style={styles.card}>
          {STOCK_ALERTS.length === 0
            ? <EmptyState title="Aucune alerte" subtitle="Tous les stocks sont OK" />
            : STOCK_ALERTS.map((alert, i) => (
                <View key={alert.id}>
                  <AlertRow alert={alert} />
                  {i < STOCK_ALERTS.length - 1 && <View style={styles.divider} />}
                </View>
              ))
          }
        </View>
      </View>

      {/* Derniers mouvements */}
      <View style={styles.section}>
        <SectionHeader title="Derniers mouvements" />
        <View style={styles.card}>
          {MOUVEMENTS_STOCK.length === 0
            ? <EmptyState icon="swap-vertical-outline" title="Aucun mouvement" />
            : MOUVEMENTS_STOCK.map((mvt, i) => (
                <View key={mvt.id}>
                  <MouvementRow mvt={mvt} />
                  {i < MOUVEMENTS_STOCK.length - 1 && <View style={styles.divider} />}
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
      flexDirection:   'row',
      alignItems:      'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      gap:             10,
    },
    rowLeft: { flex: 1, gap: 2 },
    rowTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
    rowSub:   { fontSize: 11, color: colors.textMuted },

    mvtIcon: {
      width:          32,
      height:         32,
      borderRadius:   10,
      alignItems:     'center',
      justifyContent: 'center',
    },
    mvtQte: { fontSize: 14, fontWeight: '700' },

    divider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 14 },
  });
}
