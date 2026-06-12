import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';

import { DashboardTabs, type TabItem } from '../components/ui/DashboardTabs';
import CommissionDashboardTab from '../components/tabs/CommissionDashboardTab';
import LogisticsDashboardTab  from '../components/tabs/LogisticsDashboardTab';
import SalesDashboardTab      from '../components/tabs/SalesDashboardTab';
import StockDashboardTab      from '../components/tabs/StockDashboardTab';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'vente' | 'stock' | 'logistique' | 'commission';

const TABS: TabItem<TabKey>[] = [
  { key: 'vente',       label: 'Vente'       },
  { key: 'stock',       label: 'Stock'       },
  { key: 'logistique',  label: 'Logistique'  },
  { key: 'commission',  label: 'Commission'  },
];

// ─── Écran ────────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const insets     = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<TabKey>('vente');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* En-tête */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.pageTitle}>Tableau de bord</Text>
      </View>

      {/* Barre d'onglets */}
      <DashboardTabs<TabKey>
        tabs={TABS}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {/* Contenu de l'onglet actif */}
      <View style={styles.content}>
        {activeTab === 'vente'      && <SalesDashboardTab      bottomInset={insets.bottom} />}
        {activeTab === 'stock'      && <StockDashboardTab      bottomInset={insets.bottom} />}
        {activeTab === 'logistique' && <LogisticsDashboardTab  bottomInset={insets.bottom} />}
        {activeTab === 'commission' && <CommissionDashboardTab bottomInset={insets.bottom} />}
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 16,
      paddingBottom:     12,
      backgroundColor:   colors.surface,
    },
    pageTitle: {
      fontSize:   22,
      fontWeight: '700',
      color:      colors.text,
    },
    content: {
      flex: 1,
    },
  });
}
