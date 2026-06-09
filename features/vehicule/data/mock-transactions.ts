export interface Transaction {
  id: string;
  date: string;        // YYYY-MM-DD
  reference: string;   // ex: CV-2026-0042
  montant: number;
  statut: 'paye' | 'en_attente' | 'annule';
}

export interface TransactionGroup {
  mois: string;
  total: number;
  transactions: Transaction[];
}

// ─── Générateur ────────────────────────────────────────────────────────────
let counter = 1;

function ref(): string {
  return `CV-2026-${String(counter++).padStart(4, '0')}`;
}

function day(
  vehiculeId: string,
  date: string,
  count: 2 | 3 | 4,
  montants: number[],
  statuts: Transaction['statut'][],
): Transaction[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `v${vehiculeId}-${date}-${i}`,
    date,
    reference: ref(),
    montant: montants[i % montants.length],
    statut: statuts[i % statuts.length],
  }));
}

// ─── Données simulées ──────────────────────────────────────────────────────
const DATA: Record<string, Transaction[]> = {
  // Nen Dow — véhicule actif
  '1': [
    ...day('1', '2026-05-28', 3, [25_000, 30_000, 20_000], ['paye', 'paye', 'en_attente']),
    ...day('1', '2026-05-27', 2, [30_000, 25_000],          ['paye', 'paye']),
    ...day('1', '2026-05-26', 4, [20_000, 25_000, 30_000, 20_000], ['paye', 'paye', 'paye', 'en_attente']),
    ...day('1', '2026-05-23', 3, [25_000, 30_000, 25_000],  ['paye', 'paye', 'paye']),
    ...day('1', '2026-05-22', 2, [30_000, 20_000],          ['paye', 'en_attente']),
    ...day('1', '2026-05-21', 3, [25_000, 25_000, 30_000],  ['paye', 'paye', 'paye']),
    ...day('1', '2026-05-20', 4, [20_000, 30_000, 25_000, 20_000], ['paye', 'paye', 'paye', 'paye']),
    ...day('1', '2026-05-19', 2, [25_000, 30_000],          ['paye', 'paye']),
    ...day('1', '2026-04-30', 3, [30_000, 25_000, 20_000],  ['paye', 'paye', 'en_attente']),
    ...day('1', '2026-04-29', 4, [25_000, 30_000, 25_000, 20_000], ['paye', 'paye', 'paye', 'paye']),
    ...day('1', '2026-04-28', 2, [30_000, 25_000],          ['paye', 'paye']),
    ...day('1', '2026-04-25', 3, [20_000, 25_000, 30_000],  ['paye', 'paye', 'paye']),
    ...day('1', '2026-04-24', 2, [25_000, 30_000],          ['paye', 'en_attente']),
    ...day('1', '2026-04-23', 4, [20_000, 25_000, 30_000, 25_000], ['paye', 'paye', 'paye', 'paye']),
    ...day('1', '2026-04-22', 3, [30_000, 20_000, 25_000],  ['paye', 'paye', 'paye']),
    ...day('1', '2026-04-07', 2, [25_000, 30_000],          ['paye', 'paye']),
    ...day('1', '2026-03-28', 3, [30_000, 25_000, 20_000],  ['paye', 'paye', 'paye']),
    ...day('1', '2026-03-27', 2, [25_000, 30_000],          ['paye', 'paye']),
    ...day('1', '2026-03-26', 4, [20_000, 25_000, 30_000, 20_000], ['paye', 'paye', 'paye', 'annule']),
    ...day('1', '2026-03-25', 3, [25_000, 30_000, 25_000],  ['paye', 'paye', 'paye']),
  ],

  // Baba Ousou — peu actif
  '2': [
    ...day('2', '2026-05-27', 2, [20_000, 25_000], ['en_attente', 'en_attente']),
    ...day('2', '2026-05-20', 3, [25_000, 20_000, 25_000], ['en_attente', 'en_attente', 'annule']),
    ...day('2', '2026-05-13', 2, [20_000, 25_000], ['en_attente', 'annule']),
    ...day('2', '2026-04-25', 2, [25_000, 20_000], ['annule', 'annule']),
    ...day('2', '2026-04-18', 3, [20_000, 25_000, 20_000], ['annule', 'en_attente', 'annule']),
  ],

  // Conakry 2 — peu actif
  '3': [
    ...day('3', '2026-05-26', 2, [20_000, 25_000], ['en_attente', 'en_attente']),
    ...day('3', '2026-05-19', 3, [25_000, 20_000, 25_000], ['en_attente', 'annule', 'en_attente']),
    ...day('3', '2026-04-28', 2, [20_000, 25_000], ['annule', 'en_attente']),
    ...day('3', '2026-03-31', 3, [25_000, 20_000, 25_000], ['en_attente', 'en_attente', 'annule']),
  ],
};

// ─── Groupement par mois ───────────────────────────────────────────────────
const MOIS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function getTransactionsGroupees(vehiculeId: string): TransactionGroup[] {
  const transactions = DATA[vehiculeId] ?? [];

  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const [year, month] = t.date.split('-');
    const key = `${year}-${month}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }

  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, txs]) => {
      const [year, month] = key.split('-');
      return {
        mois: `${MOIS_FR[parseInt(month) - 1]} ${year}`,
        total: txs.reduce((sum, t) => sum + t.montant, 0),
        transactions: txs.sort((a, b) => b.date.localeCompare(a.date)),
      };
    });
}
