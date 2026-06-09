export type CategorieFrais = 'carburant' | 'reparation' | 'entretien' | 'pneus' | 'lavage' | 'autre';
export type StatutFrais = 'paye' | 'en_attente';

export interface Frais {
  id: string;
  date: string;        // YYYY-MM-DD
  reference: string;   // FRS-2026-XXXX
  categorie: CategorieFrais;
  montant: number;
  statut: StatutFrais;
}

export interface FraisGroup {
  mois: string;
  total: number;
  items: Frais[];
}

export const CATEGORIE_CONFIG: Record<CategorieFrais, { label: string; icone: string }> = {
  carburant:  { label: 'Carburant',  icone: '⛽' },
  reparation: { label: 'Réparation', icone: '🔧' },
  entretien:  { label: 'Entretien',  icone: '🛠️' },
  pneus:      { label: 'Pneus',      icone: '🔘' },
  lavage:     { label: 'Lavage',     icone: '🫧' },
  autre:      { label: 'Autre',      icone: '📋' },
};

// ─── Générateur ────────────────────────────────────────────────────────────
let counter = 1;
function ref() { return `FRS-2026-${String(counter++).padStart(4, '0')}`; }

function f(
  vehiculeId: string,
  date: string,
  categorie: CategorieFrais,
  montant: number,
  statut: StatutFrais = 'paye',
): Frais {
  return { id: `fv${vehiculeId}-${date}-${categorie}`, date, reference: ref(), categorie, montant, statut };
}

const DATA: Record<string, Frais[]> = {
  '1': [
    f('1', '2026-05-28', 'carburant',  180_000),
    f('1', '2026-05-26', 'carburant',  175_000),
    f('1', '2026-05-22', 'lavage',      15_000),
    f('1', '2026-05-20', 'carburant',  190_000),
    f('1', '2026-05-15', 'entretien',   80_000),
    f('1', '2026-05-10', 'carburant',  185_000),
    f('1', '2026-04-29', 'reparation', 350_000),
    f('1', '2026-04-25', 'carburant',  180_000),
    f('1', '2026-04-22', 'pneus',      240_000),
    f('1', '2026-04-18', 'carburant',  175_000),
    f('1', '2026-04-14', 'lavage',      15_000),
    f('1', '2026-04-08', 'carburant',  185_000),
    f('1', '2026-04-03', 'entretien',   60_000, 'en_attente'),
    f('1', '2026-03-28', 'carburant',  180_000),
    f('1', '2026-03-24', 'reparation', 120_000),
    f('1', '2026-03-20', 'carburant',  175_000),
    f('1', '2026-03-15', 'lavage',      15_000),
    f('1', '2026-03-10', 'carburant',  185_000),
    f('1', '2026-03-05', 'pneus',      120_000, 'en_attente'),
  ],
  '2': [
    f('2', '2026-05-27', 'carburant',   80_000),
    f('2', '2026-05-20', 'entretien',   45_000),
    f('2', '2026-05-13', 'carburant',   85_000),
    f('2', '2026-04-25', 'reparation', 150_000, 'en_attente'),
    f('2', '2026-04-15', 'carburant',   80_000),
    f('2', '2026-04-08', 'lavage',      10_000),
    f('2', '2026-03-28', 'carburant',   85_000),
    f('2', '2026-03-15', 'pneus',       90_000),
  ],
  '3': [
    f('3', '2026-05-26', 'carburant',   40_000),
    f('3', '2026-05-19', 'reparation',  60_000, 'en_attente'),
    f('3', '2026-05-12', 'carburant',   45_000),
    f('3', '2026-04-28', 'entretien',   30_000),
    f('3', '2026-04-14', 'carburant',   40_000),
    f('3', '2026-03-31', 'carburant',   45_000),
    f('3', '2026-03-20', 'lavage',       8_000),
    f('3', '2026-03-10', 'autre',       25_000, 'en_attente'),
  ],
};

const MOIS_FR = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

export function getFraisGroupes(vehiculeId: string): FraisGroup[] {
  const items = DATA[vehiculeId] ?? [];
  const map = new Map<string, Frais[]>();

  for (const item of items) {
    const [year, month] = item.date.split('-');
    const key = `${year}-${month}`;
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }

  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, its]) => {
      const [year, month] = key.split('-');
      return {
        mois: `${MOIS_FR[Number.parseInt(month) - 1]} ${year}`,
        total: its.reduce((s, i) => s + i.montant, 0),
        items: [...its].sort((a, b) => b.date.localeCompare(a.date)),
      };
    });
}
