// Onglet Vente — contenu original du DashboardScreen, sans modification de logique.
import { useMemo, useState } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Svg, Polyline, Path, Circle } from 'react-native-svg';

import { Colors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { IconSymbol } from '@/shared/components/ui/icon-symbol';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Period =
  | 'aujourdhui'
  | 'hier'
  | 'cette_semaine'
  | 'semaine_derniere'
  | 'ce_mois'
  | 'mois_dernier'
  | 'ce_trimestre'
  | 'trimestre_dernier'
  | 'cette_annee'
  | 'annee_derniere';

type Trend = 'up' | 'down';

interface KpiData {
  id:     string;
  label:  string;
  value:  string;
  change: string;
  trend:  Trend;
  points: number[];
}

// ─── Périodes ─────────────────────────────────────────────────────────────────

const PERIODS: { key: Period; label: string }[] = [
  { key: 'aujourdhui',        label: "Aujourd'hui"       },
  { key: 'hier',              label: 'Hier'              },
  { key: 'cette_semaine',     label: 'Cette semaine'     },
  { key: 'semaine_derniere',  label: 'Semaine dernière'  },
  { key: 'ce_mois',           label: 'Ce mois'           },
  { key: 'mois_dernier',      label: 'Mois dernier'      },
  { key: 'ce_trimestre',      label: 'Ce trimestre'      },
  { key: 'trimestre_dernier', label: 'Trimestre dernier' },
  { key: 'cette_annee',       label: 'Cette année'       },
  { key: 'annee_derniere',    label: 'Année dernière'    },
];

// ─── Données mock ─────────────────────────────────────────────────────────────

function fmtGNF(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m < 10 ? m.toFixed(1) : Math.round(m)} M GNF`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)} k GNF`;
  return `${Math.round(n)} GNF`;
}

function fmtN(n: number): string {
  return String(Math.max(1, Math.round(n)));
}

function scalePoints(base: number[], factor: number): number[] {
  return base.map(v => Math.round(v * factor * 10) / 10);
}

const B = {
  factures:     1_350_000,
  payees:       550_000,
  encaissement: 800_000,
  ventes:       24,
  clients:      8,
  produits:     186,
};

const BASE_POINTS = {
  factures:     [38,52,44,58,52,68,62,76,72,88],
  payees:       [28,38,32,46,42,52,58,66,62,78],
  encaissement: [78,72,82,68,72,62,68,58,62,52],
  ventes:       [18,28,22,32,28,42,38,48,52,62],
  clients:      [5,5,6,6,6,7,7,7,8,8],
  produits:     [78,92,85,100,94,112,108,128,138,158],
};

type ChangeMap = Record<keyof typeof B, { pct: string; trend: Trend }>;

const PERIOD_CONFIG: Record<Period, { factor: number; changes: ChangeMap }> = {
  aujourdhui:        { factor: 1/30,   changes: { factures:{pct:'+3%',trend:'up'},   payees:{pct:'+5%',trend:'up'},   encaissement:{pct:'-1%',trend:'down'}, ventes:{pct:'+3%',trend:'up'},   clients:{pct:'+0%',trend:'up'},  produits:{pct:'+4%',trend:'up'}  } },
  hier:              { factor: 1/32,   changes: { factures:{pct:'+1%',trend:'up'},   payees:{pct:'+2%',trend:'up'},   encaissement:{pct:'-2%',trend:'down'}, ventes:{pct:'+1%',trend:'up'},   clients:{pct:'+0%',trend:'up'},  produits:{pct:'+2%',trend:'up'}  } },
  cette_semaine:     { factor: 1/4.3,  changes: { factures:{pct:'+6%',trend:'up'},   payees:{pct:'+8%',trend:'up'},   encaissement:{pct:'-2%',trend:'down'}, ventes:{pct:'+7%',trend:'up'},   clients:{pct:'+1%',trend:'up'},  produits:{pct:'+9%',trend:'up'}  } },
  semaine_derniere:  { factor: 1/4.8,  changes: { factures:{pct:'+4%',trend:'up'},   payees:{pct:'+6%',trend:'up'},   encaissement:{pct:'-3%',trend:'down'}, ventes:{pct:'+5%',trend:'up'},   clients:{pct:'+0%',trend:'up'},  produits:{pct:'+7%',trend:'up'}  } },
  ce_mois:           { factor: 1,      changes: { factures:{pct:'+8%',trend:'up'},   payees:{pct:'+15%',trend:'up'},  encaissement:{pct:'-3%',trend:'down'}, ventes:{pct:'+12%',trend:'up'},  clients:{pct:'+2%',trend:'up'},  produits:{pct:'+22%',trend:'up'} } },
  mois_dernier:      { factor: 0.88,   changes: { factures:{pct:'+3%',trend:'up'},   payees:{pct:'+5%',trend:'up'},   encaissement:{pct:'-1%',trend:'down'}, ventes:{pct:'+4%',trend:'up'},   clients:{pct:'+1%',trend:'up'},  produits:{pct:'+8%',trend:'up'}  } },
  ce_trimestre:      { factor: 3.1,    changes: { factures:{pct:'+11%',trend:'up'},  payees:{pct:'+18%',trend:'up'},  encaissement:{pct:'-6%',trend:'down'}, ventes:{pct:'+15%',trend:'up'},  clients:{pct:'+8%',trend:'up'},  produits:{pct:'+25%',trend:'up'} } },
  trimestre_dernier: { factor: 2.75,   changes: { factures:{pct:'+7%',trend:'up'},   payees:{pct:'+12%',trend:'up'},  encaissement:{pct:'-4%',trend:'down'}, ventes:{pct:'+9%',trend:'up'},   clients:{pct:'+5%',trend:'up'},  produits:{pct:'+18%',trend:'up'} } },
  cette_annee:       { factor: 12.5,   changes: { factures:{pct:'+14%',trend:'up'},  payees:{pct:'+22%',trend:'up'},  encaissement:{pct:'-8%',trend:'down'}, ventes:{pct:'+18%',trend:'up'},  clients:{pct:'+12%',trend:'up'}, produits:{pct:'+30%',trend:'up'} } },
  annee_derniere:    { factor: 11,     changes: { factures:{pct:'+9%',trend:'up'},   payees:{pct:'+15%',trend:'up'},  encaissement:{pct:'-5%',trend:'down'}, ventes:{pct:'+12%',trend:'up'},  clients:{pct:'+8%',trend:'up'},  produits:{pct:'+22%',trend:'up'} } },
};

function buildKpis(period: Period): KpiData[] {
  const { factor, changes } = PERIOD_CONFIG[period];
  const isCount = (id: string) => id === 'ventes' || id === 'clients' || id === 'produits';
  return (Object.keys(B) as (keyof typeof B)[]).map(id => {
    const raw   = B[id] * factor;
    const value = isCount(id) ? fmtN(raw) : fmtGNF(raw);
    return { id, label: kpiLabel(id), value, change: changes[id].pct, trend: changes[id].trend, points: scalePoints(BASE_POINTS[id], factor) };
  });
}

function kpiLabel(id: string): string {
  const labels: Record<string, string> = {
    factures:     'Total Factures',
    payees:       'Factures payées',
    encaissement: 'Reste à encaisser',
    ventes:       'Nb. ventes (commandes)',
    clients:      'Clients actifs',
    produits:     'Produits livrés',
  };
  return labels[id] ?? id;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

const SPARK_W = 90;
const SPARK_H = 40;

function buildSvgPoints(raw: number[]): string {
  if (raw.length < 2) return '';
  const min = Math.min(...raw), max = Math.max(...raw), range = max - min || 1;
  const step = SPARK_W / (raw.length - 1), pad = 3;
  return raw.map((v, i) => {
    const x = +(i * step).toFixed(1);
    const y = +(SPARK_H - pad - ((v - min) / range) * (SPARK_H - pad * 2)).toFixed(1);
    return `${x},${y}`;
  }).join(' ');
}

function Sparkline({ points, color }: Readonly<{ points: number[]; color: string }>) {
  const pts = useMemo(() => buildSvgPoints(points), [points]);
  return (
    <Svg width={SPARK_W} height={SPARK_H}>
      <Polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Carte KPI ────────────────────────────────────────────────────────────────

function KpiCard({ card }: Readonly<{ card: KpiData }>) {
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);
  const trendColor = card.trend === 'up' ? colors.success : colors.danger;
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardLabel}>{card.label}</Text>
        <Text style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit>{card.value}</Text>
        <View style={styles.changeRow}>
          <IconSymbol name={card.trend === 'up' ? 'arrow.up' : 'arrow.down'} size={11} color={trendColor} />
          <Text style={[styles.changeText, { color: trendColor }]}>{card.change}</Text>
        </View>
      </View>
      <Sparkline points={card.points} color={trendColor} />
    </View>
  );
}

// ─── SVG Charts ───────────────────────────────────────────────────────────────

interface ChartSeg { id: string; label: string; pct: number; color: string; }

const SEG_GAP = 2.5;
const LG_SIZE = 180, LG_CX = LG_SIZE/2, LG_CY = LG_SIZE/2, LG_RO = 78, LG_RI = 50;

function polarXY(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, ro: number, ri: number, a1: number, a2: number): string {
  const s = polarXY(cx, cy, ro, a1), e = polarXY(cx, cy, ro, a2), lg = a2 - a1 > 180 ? 1 : 0;
  if (ri <= 0) return [`M ${cx.toFixed(2)} ${cy.toFixed(2)}`,`L ${s.x.toFixed(2)} ${s.y.toFixed(2)}`,`A ${ro} ${ro} 0 ${lg} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`,'Z'].join(' ');
  const i1 = polarXY(cx, cy, ri, a1), i2 = polarXY(cx, cy, ri, a2);
  return [`M ${s.x.toFixed(2)} ${s.y.toFixed(2)}`,`A ${ro} ${ro} 0 ${lg} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`,`L ${i2.x.toFixed(2)} ${i2.y.toFixed(2)}`,`A ${ri} ${ri} 0 ${lg} 0 ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,'Z'].join(' ');
}

function buildArcs(segs: ChartSeg[], cx: number, cy: number, ro: number, ri: number) {
  const total = segs.reduce((s, v) => s + v.pct, 0) || 1;
  const gap = ri > 0 ? SEG_GAP : 1.2;
  let angle = 0;
  return segs.map(seg => {
    const span = (seg.pct / total) * 360, start = angle + gap/2, end = angle + span - gap/2;
    angle += span;
    return { path: arcPath(cx, cy, ro, ri, start, end), color: seg.color };
  });
}

const VEHICLE_SEGS: ChartSeg[] = [
  { id: 'tricycle', label: 'Tricycle', pct: 0.45, color: '#2563eb' },
  { id: 'camion',   label: 'Camion',   pct: 0.30, color: '#22c55e' },
  { id: 'minibus',  label: 'Minibus',  pct: 0.25, color: '#f59e0b' },
];
const SITE_SEGS: ChartSeg[] = [
  { id: 'matoto',  label: 'Matoto',         pct: 0.45, color: '#2563eb' },
  { id: 'conakry', label: 'Conakry Centre', pct: 0.35, color: '#22c55e' },
  { id: 'dixinn',  label: 'Dixinn',         pct: 0.20, color: '#f59e0b' },
];
const PRODUIT_SEGS: ChartSeg[] = [
  { id: 'pack6',  label: 'Pack 6 btes',  pct: 0.55, color: '#2563eb' },
  { id: 'b15',    label: 'Btle 1.5L',    pct: 0.25, color: '#22c55e' },
  { id: 'b05',    label: 'Btle 0.5L',    pct: 0.12, color: '#f59e0b' },
  { id: 'pack12', label: 'Pack 12 btes', pct: 0.08, color: '#8b5cf6' },
];

interface ChartProps {
  segs: ChartSeg[]; cx: number; cy: number; size: number; ro: number; ri: number;
  valueBase: number; formatValue: (base: number, pct: number) => string;
}

function ChartWidget({ segs, cx, cy, size, ro, ri, valueBase, formatValue }: Readonly<ChartProps>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const arcs   = useMemo(() => buildArcs(segs, cx, cy, ro, ri), [segs, cx, cy, ro, ri]);
  return (
    <>
      <Svg width={size} height={size}>
        {arcs.map((arc, i) => <Path key={segs[i].id} d={arc.path} fill={arc.color} />)}
        {ri > 0 && <Circle cx={cx} cy={cy} r={ri - 2} fill={colors.surface} />}
      </Svg>
      <View style={styles.legend}>
        {segs.map(seg => (
          <View key={seg.id} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <View style={styles.legendInfo}>
              <Text style={styles.legendLabel}>{seg.label}</Text>
              <Text style={styles.legendValue}>{formatValue(valueBase, seg.pct)}</Text>
              <Text style={styles.legendPct}>{Math.round(seg.pct * 100)}%</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function VehicleChart({ facturesTotal }: Readonly<{ facturesTotal: number }>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Catégorie de véhicule</Text>
      <View style={styles.chartBody}>
        <ChartWidget segs={VEHICLE_SEGS} cx={LG_CX} cy={LG_CY} size={LG_SIZE} ro={LG_RO} ri={LG_RI} valueBase={facturesTotal} formatValue={(b,p) => fmtGNF(b*p)} />
      </View>
    </View>
  );
}

function SiteChart({ facturesTotal }: Readonly<{ facturesTotal: number }>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>CA par site</Text>
      <View style={styles.chartBody}>
        <ChartWidget segs={SITE_SEGS} cx={LG_CX} cy={LG_CY} size={LG_SIZE} ro={LG_RO} ri={LG_RI} valueBase={facturesTotal} formatValue={(b,p) => fmtGNF(b*p)} />
      </View>
    </View>
  );
}

function ProduitChart({ ventesTotal }: Readonly<{ ventesTotal: number }>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Ventes par produit</Text>
      <View style={styles.chartBody}>
        <ChartWidget segs={PRODUIT_SEGS} cx={LG_CX} cy={LG_CY} size={LG_SIZE} ro={LG_RO} ri={0} valueBase={ventesTotal} formatValue={(b,p) => `${fmtN(b*p)} vte${Math.round(b*p)>1?'s':''}`} />
      </View>
    </View>
  );
}

// ─── Sélecteur de période ─────────────────────────────────────────────────────

function PeriodPicker({ value, onChange }: Readonly<{ value: Period; onChange: (p: Period) => void }>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const label = PERIODS.find(p => p.key === value)?.label ?? '';
  return (
    <>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={styles.pickerBtnText}>{label}</Text>
        <IconSymbol name="chevron.down" size={13} color={colors.textMuted} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Choisir la période</Text>
            {PERIODS.map(p => {
              const selected = p.key === value;
              return (
                <TouchableOpacity key={p.key} style={[styles.sheetRow, selected && styles.sheetRowActive]} onPress={() => { onChange(p.key); setOpen(false); }} activeOpacity={0.6}>
                  <Text style={[styles.sheetRowText, selected && { color: colors.primary, fontWeight: '600' }]}>{p.label}</Text>
                  {selected && <IconSymbol name="checkmark" size={16} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  bottomInset: number;
}

export default function SalesDashboardTab({ bottomInset }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [period, setPeriod] = useState<Period>('ce_mois');
  const kpis          = useMemo(() => buildKpis(period), [period]);
  const facturesTotal = useMemo(() => B.factures * PERIOD_CONFIG[period].factor, [period]);
  const ventesTotal   = useMemo(() => B.ventes   * PERIOD_CONFIG[period].factor, [period]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.filterRow}>
        <PeriodPicker value={period} onChange={setPeriod} />
      </View>
      {kpis.map(card => <KpiCard key={card.id} card={card} />)}
      <VehicleChart facturesTotal={facturesTotal} />
      <SiteChart    facturesTotal={facturesTotal} />
      <ProduitChart ventesTotal={ventesTotal} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    scroll:    { flex: 1, backgroundColor: colors.background },
    content:   { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
    filterRow: { flexDirection: 'row', justifyContent: 'flex-end' },

    pickerBtn:     { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:colors.surface, borderWidth:1, borderColor:colors.border, borderRadius:20, paddingHorizontal:12, paddingVertical:7 },
    pickerBtnText: { fontSize:13, fontWeight:'500', color:colors.text },

    modalBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'flex-end' },
    sheet:         { backgroundColor:colors.surface, borderTopLeftRadius:24, borderTopRightRadius:24, paddingHorizontal:20, paddingBottom:32, paddingTop:12 },
    sheetHandle:   { width:40, height:4, borderRadius:2, backgroundColor:colors.border, alignSelf:'center', marginBottom:16 },
    sheetTitle:    { fontSize:15, fontWeight:'700', color:colors.text, marginBottom:12 },
    sheetRow:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:13, borderBottomWidth:1, borderBottomColor:colors.borderLight },
    sheetRowActive:{ backgroundColor:colors.primaryLight+'44', marginHorizontal:-20, paddingHorizontal:20 },
    sheetRowText:  { fontSize:15, color:colors.text },

    card:       { backgroundColor:colors.surface, borderRadius:16, borderWidth:1, borderColor:colors.border, paddingVertical:16, paddingHorizontal:18, flexDirection:'row', alignItems:'center', justifyContent:'space-between', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2 },
    cardLeft:   { flex:1, gap:4, paddingRight:12 },
    cardLabel:  { fontSize:12, fontWeight:'500', color:colors.textMuted, textTransform:'uppercase', letterSpacing:0.5 },
    cardValue:  { fontSize:22, fontWeight:'700', color:colors.text, lineHeight:28 },
    changeRow:  { flexDirection:'row', alignItems:'center', gap:3, marginTop:2 },
    changeText: { fontSize:13, fontWeight:'600' },

    chartCard:   { backgroundColor:colors.surface, borderRadius:16, borderWidth:1, borderColor:colors.border, padding:18, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2 },
    chartTitle:  { fontSize:15, fontWeight:'700', color:colors.text, marginBottom:16 },
    chartBody:   { flexDirection:'row', alignItems:'center', gap:16 },
    legend:      { flex:1, gap:12 },
    legendRow:   { flexDirection:'row', alignItems:'flex-start', gap:10 },
    legendDot:   { width:12, height:12, borderRadius:6, marginTop:3 },
    legendInfo:  { flex:1, gap:1 },
    legendLabel: { fontSize:13, fontWeight:'600', color:colors.text },
    legendValue: { fontSize:12, color:colors.textMuted },
    legendPct:   { fontSize:11, color:colors.textLight, fontWeight:'500' },
  });
}
