import { Dimensions } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

const { width: W, height: SCREEN_H } = Dimensions.get('window');
const H = SCREEN_H * 0.58;

// ── Nuage : bosses en HAUT et en BAS (fidèle au sachet) ───────────────────
function Cloud({ x, y, s = 1, op = 0.85 }: Readonly<{ x: number; y: number; s?: number; op?: number }>) {
  return (
    <G transform={`translate(${x},${y}) scale(${s})`} opacity={op}>
      <Circle cx={-26} cy={-10} r={17} fill="white" />
      <Circle cx={0}   cy={-22} r={22} fill="white" />
      <Circle cx={26}  cy={-12} r={18} fill="white" />
      <Ellipse cx={0} cy={4} rx={47} ry={18} fill="white" />
      <Circle cx={-20} cy={17} r={12} fill="white" />
      <Circle cx={2}   cy={21} r={14} fill="white" />
      <Circle cx={22}  cy={17} r={12} fill="white" />
    </G>
  );
}

// ── Goutte d'eau : ronde en bas, pointue en haut ───────────────────────────
function Drop({ x, y, r = 10, op = 0.75 }: Readonly<{ x: number; y: number; r?: number; op?: number }>) {
  const h  = r * 1.85;
  const cy = r * 0.82;
  const d = `M 0 ${-h} C ${r * 0.65} ${-h * 0.65} ${r} ${-r * 0.15} ${r} ${cy} A ${r} ${r} 0 0 1 ${-r} ${cy} C ${-r} ${-r * 0.15} ${-r * 0.65} ${-h * 0.65} 0 ${-h} Z`;
  return (
    <G transform={`translate(${x},${y})`} opacity={op}>
      <Path d={d} fill="white" />
    </G>
  );
}

// ── Étoile 5 branches ─────────────────────────────────────────────────────
function Star({ x, y, r = 10, op = 0.85 }: Readonly<{ x: number; y: number; r?: number; op?: number }>) {
  const ri = r * 0.38;
  const PI = Math.PI;
  let d = '';
  for (let i = 0; i < 5; i++) {
    const oa = -PI / 2 + (i * 2 * PI) / 5;
    const ia = oa + PI / 5;
    const ox = Number.parseFloat((r  * Math.cos(oa)).toFixed(2));
    const oy = Number.parseFloat((r  * Math.sin(oa)).toFixed(2));
    const ix = Number.parseFloat((ri * Math.cos(ia)).toFixed(2));
    const iy = Number.parseFloat((ri * Math.sin(ia)).toFixed(2));
    d += i === 0 ? `M ${ox} ${oy}` : ` L ${ox} ${oy}`;
    d += ` L ${ix} ${iy}`;
  }
  d += ' Z';
  return (
    <G transform={`translate(${x},${y})`} opacity={op}>
      <Path d={d} fill="white" />
    </G>
  );
}

// ── Bouteille d'eau avec étranglement (waist) au milieu ───────────────────
function Bottle({ cx, cy, w, h }: Readonly<{ cx: number; cy: number; w: number; h: number }>) {
  const hw  = w / 2;      // demi-largeur max
  const nc  = w * 0.14;   // demi-largeur col (très slim)
  const cc  = w * 0.15;   // demi-largeur bouchon
  const wst = w * 0.45;   // demi-largeur taille (étranglement)

  const yTop   = cy - h / 2;
  const yCapB  = yTop + h * 0.020;   // bas bouchon
  const yNeckB = yTop + h * 0.100;   // bas col
  const yShldB = yTop + h * 0.266;   // fin épaule / début corps large haut
  const yLblT  = yTop + h * 0.285;   // haut étiquette
  const yLblB  = yTop + h * 0.466;   // bas étiquette
  const yWaist = yTop + h * 0.566;   // étranglement
  const yWidL  = yTop + h * 0.655;   // début corps large bas
  const yBodyB = yTop + h * 0.900;   // fin corps
  const yBot   = cy  + h / 2;        // fond

  const body = [
    // Bouchon
    `M ${cx - cc} ${yTop}`,
    `L ${cx + cc} ${yTop}`,
    `L ${cx + cc} ${yCapB}`,
    // Col droit
    `L ${cx + nc} ${yCapB}`,
    `L ${cx + nc} ${yNeckB}`,
    // Épaule droite : courbe C prononcée (col → pleine largeur rapidement)
    `C ${cx + nc} ${yNeckB + h * 0.13} ${cx + hw} ${yShldB - h * 0.02} ${cx + hw} ${yShldB}`,
    // Corps haut droit (légèrement bombé)
    `Q ${cx + hw * 1.04} ${(yShldB + yLblB) / 2} ${cx + hw} ${yLblB}`,
    // S-curve : corps haut → étranglement
    `C ${cx + hw}  ${yWaist - h * 0.06} ${cx + wst} ${yWaist - h * 0.01} ${cx + wst} ${yWaist}`,
    // S-curve : étranglement → corps bas large
    `C ${cx + wst} ${yWaist + h * 0.05} ${cx + hw}  ${yWidL  + h * 0.01} ${cx + hw}  ${yWidL}`,
    // Corps bas droit (légèrement bombé)
    `Q ${cx + hw * 1.03} ${(yWidL + yBodyB) / 2} ${cx + hw * 0.82} ${yBodyB}`,
    // Fond arrondi
    `C ${cx + hw * 0.82} ${yBot} ${cx + hw * 0.4} ${yBot} ${cx} ${yBot}`,
    `C ${cx - hw * 0.4} ${yBot} ${cx - hw * 0.82} ${yBot} ${cx - hw * 0.82} ${yBodyB}`,
    // Corps bas gauche
    `Q ${cx - hw * 1.03} ${(yWidL + yBodyB) / 2} ${cx - hw} ${yWidL}`,
    // S-curve gauche : corps bas → étranglement
    `C ${cx - hw}  ${yWidL  + h * 0.01} ${cx - wst} ${yWaist + h * 0.05} ${cx - wst} ${yWaist}`,
    // S-curve gauche : étranglement → corps haut
    `C ${cx - wst} ${yWaist - h * 0.01} ${cx - hw}  ${yWaist - h * 0.06} ${cx - hw}  ${yLblB}`,
    // Corps haut gauche
    `Q ${cx - hw * 1.04} ${(yShldB + yLblB) / 2} ${cx - hw} ${yShldB}`,
    // Épaule gauche
    `C ${cx - hw} ${yShldB - h * 0.02} ${cx - nc} ${yNeckB + h * 0.13} ${cx - nc} ${yNeckB}`,
    // Col et bouchon gauche
    `L ${cx - nc} ${yCapB}`,
    `L ${cx - cc} ${yCapB}`,
    'Z',
  ].join(' ');

  // Bague sous le bouchon
  const ring  = `M ${cx-cc-2} ${yCapB} L ${cx+cc+2} ${yCapB} L ${cx+cc+2} ${yCapB+h*0.016} L ${cx-cc-2} ${yCapB+h*0.016} Z`;
  // Étiquette dans la zone large haute
  const label = `M ${cx-hw+3} ${yLblT} L ${cx+hw-3} ${yLblT} L ${cx+hw-3} ${yLblB} L ${cx-hw+3} ${yLblB} Z`;
  // Reflet haut gauche
  const hl1   = `M ${cx-hw*0.65} ${yShldB+h*0.02} L ${cx-hw*0.38} ${yShldB+h*0.02} L ${cx-hw*0.38} ${yLblT-h*0.01} L ${cx-hw*0.65} ${yLblT-h*0.01} Z`;
  // Reflet bas gauche
  const hl2   = `M ${cx-hw*0.55} ${yLblB+h*0.04} L ${cx-hw*0.34} ${yLblB+h*0.04} L ${cx-hw*0.34} ${yBodyB-h*0.1} L ${cx-hw*0.55} ${yBodyB-h*0.1} Z`;

  return (
    <G>
      <Path d={body}  fill="white" opacity={0.15} />
      <Path d={ring}  fill="white" opacity={0.28} />
      <Path d={label} fill="white" opacity={0.22} />
      <Path d={hl1}   fill="white" opacity={0.09} />
      <Path d={hl2}   fill="white" opacity={0.07} />
    </G>
  );
}

export function HeroIllustration() {
  const cx = W / 2;
  const cy = H * 0.5;

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>

      {/* Bouteille d'eau au centre */}
      <Bottle cx={cx} cy={cy} w={W * 0.3} h={H * 0.78} />

      {/* ── Nuages ─────────────────────────────────────────────────────────── */}
      <Cloud x={W * 0.16} y={H * 0.18} s={1.2} op={0.72} />
      <Cloud x={W * 0.78} y={H * 0.13} s={0.9} op={0.62} />
      <Cloud x={W * 0.5}  y={H * 0.06} s={0.6} op={0.45} />
      <Cloud x={W * 0.22} y={H * 0.76} s={0.5} op={0.35} />
      <Cloud x={W * 0.8}  y={H * 0.8}  s={0.6} op={0.32} />

      {/* ── Gouttes d'eau ───────────────────────────────────────────────────── */}
      <Drop x={W * 0.1}  y={H * 0.42} r={13} op={0.65} />
      <Drop x={W * 0.88} y={H * 0.36} r={11} op={0.6} />
      <Drop x={W * 0.28} y={H * 0.23} r={9}  op={0.55} />
      <Drop x={W * 0.74} y={H * 0.63} r={10} op={0.52} />
      <Drop x={W * 0.63} y={H * 0.15} r={8}  op={0.5} />
      <Drop x={W * 0.15} y={H * 0.66} r={7}  op={0.45} />
      <Drop x={W * 0.83} y={H * 0.21} r={8}  op={0.45} />

      {/* ── Étoiles 5 branches ──────────────────────────────────────────────── */}
      <Star x={W * 0.07} y={H * 0.75} r={10} op={0.75} />
      <Star x={W * 0.9}  y={H * 0.56} r={12} op={0.7} />
      <Star x={W * 0.52} y={H * 0.88} r={9}  op={0.65} />
      <Star x={W * 0.18} y={H * 0.87} r={7}  op={0.55} />
      <Star x={W * 0.76} y={H * 0.29} r={8}  op={0.55} />
      <Star x={W * 0.4}  y={H * 0.1}  r={7}  op={0.5} />
      <Star x={W * 0.92} y={H * 0.84} r={6}  op={0.45} />

    </Svg>
  );
}
