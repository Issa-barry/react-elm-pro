import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { blue } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { formatMontant } from '@/shared/utils/format';
import type { AccueilStats } from '../services/stats.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING  = 24;
const CARD_GAP   = 12;
const CARD_WIDTH = SCREEN_WIDTH - H_PADDING * 2;
const CARD_HEIGHT = 148;

interface Props {
  stats:   AccueilStats | null;
  loading: boolean;
}

interface CardData {
  id:        string;
  titre:     string;
  montant:   number;
  sousTitre: string;
  variant:   'primary' | 'white';
}

function WavePrimary() {
  return (
    <Svg
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      viewBox="0 0 900 600"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}>
      <Rect x="0" y="0" width="900" height="600" fill={blue[600]} />
      <Path
        d="M0 400L30 386.5C60 373 120 346 180 334.8C240 323.7 300 328.3 360 345.2C420 362 480 391 540 392C600 393 660 366 720 355.2C780 344.3 840 349.7 870 352.3L900 355L900 601L870 601C840 601 780 601 720 601C660 601 600 601 540 601C480 601 420 601 360 601C300 601 240 601 180 601C120 601 60 601 30 601L0 601Z"
        fill={blue[500]}
      />
    </Svg>
  );
}

function CardSeparator() {
  return <View style={{ width: CARD_GAP }} />;
}

function CardPrimary({ card }: Readonly<{ card: CardData }>) {
  const { colors } = useTheme();
  return (
    <View style={[staticStyles.card, { backgroundColor: colors.primary }]}>
      <WavePrimary />
      <Text style={staticStyles.titrePrimary}>{card.titre}</Text>
      <Text style={staticStyles.montantPrimary}>{formatMontant(card.montant)}</Text>
      <Text style={staticStyles.sousTitrePrimary}>{card.sousTitre}</Text>
    </View>
  );
}

function CardWhite({ card }: Readonly<{ card: CardData }>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeCardWhiteStyles(colors), [colors]);
  return (
    <View style={[staticStyles.card, styles.cardWhite]}>
      <Text style={styles.titreWhite}>{card.titre}</Text>
      <Text style={styles.montantWhite}>{formatMontant(card.montant)}</Text>
      <Text style={styles.sousTitreWhite}>{card.sousTitre}</Text>
    </View>
  );
}

export default function StatsCarousel({ stats, loading }: Readonly<Props>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { colors } = useTheme();
  const styles = useMemo(() => makeDotsStyles(colors), [colors]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
    setActiveIndex(index);
  };

  if (loading && !stats) {
    return (
      <View style={staticStyles.loadingBox}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const nbTotal = stats?.nb_total ?? 0;
  const cards: CardData[] = [
    {
      id: '1',
      titre: 'Total Factures',
      montant: stats?.total_factures ?? 0,
      sousTitre: `${nbTotal} facture${nbTotal > 1 ? 's' : ''}`,
      variant: 'primary',
    },
    {
      id: '2',
      titre: 'Factures payées',
      montant: stats?.factures_payees ?? 0,
      sousTitre: `${stats?.nb_payees ?? 0} réglée${(stats?.nb_payees ?? 0) > 1 ? 's' : ''}`,
      variant: 'white',
    },
    {
      id: '3',
      titre: 'Reste à encaisser',
      montant: stats?.reste_encaisser ?? 0,
      sousTitre: `${stats?.nb_impayees ?? 0} en attente`,
      variant: 'white',
    },
  ];

  return (
    <View style={staticStyles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        horizontal
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={staticStyles.list}
        ItemSeparatorComponent={CardSeparator}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) =>
          item.variant === 'primary'
            ? <CardPrimary card={item} />
            : <CardWhite card={item} />
        }
      />
      <View style={staticStyles.dots}>
        {cards.map((card, i) => (
          <View key={card.id} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const staticStyles = StyleSheet.create({
  container:  { gap: 8 },
  list:       { paddingHorizontal: H_PADDING },
  loadingBox: { height: CARD_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  card:       { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 16, padding: 20, overflow: 'hidden', justifyContent: 'space-between' },
  dots:       { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 },

  titrePrimary:     { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500' },
  montantPrimary:   { color: '#ffffff', fontSize: 26, fontWeight: '700' },
  sousTitrePrimary: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
});

function makeCardWhiteStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    cardWhite:      { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    titreWhite:     { color: colors.textMuted, fontSize: 13, fontWeight: '500', textAlign: 'center' },
    montantWhite:   { color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
    sousTitreWhite: { color: colors.textLight, fontSize: 12, textAlign: 'center' },
  });
}

function makeDotsStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
    dotActive: { width: 18, backgroundColor: colors.primary, borderRadius: 3 },
  });
}
