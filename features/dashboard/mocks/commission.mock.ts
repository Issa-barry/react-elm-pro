// Données mockées — onglet Commission

export type CommissionStatus = 'en_attente' | 'payee' | 'annulee';

export interface CommissionStat {
  id:    string;
  label: string;
  value: string;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

export interface Commission {
  id:      string;
  agent:   string;
  montant: number;
  statut:  CommissionStatus;
  periode: string;
  date:    string;
  type:    string;
}

export const COMMISSION_STATS: CommissionStat[] = [
  { id: 'a_payer',       label: 'Commissions à payer', value: '12',        color: 'warning' },
  { id: 'payees',        label: 'Commissions payées',  value: '34',        color: 'success' },
  { id: 'montant_payer', label: 'Montant à payer',     value: '2,4 M GNF', color: 'danger'  },
  { id: 'montant_paye',  label: 'Montant payé',        value: '6,8 M GNF', color: 'primary' },
];

export const COMMISSIONS: Commission[] = [
  { id: '1', agent: 'Moussa Sidibé',    montant: 250_000, statut: 'en_attente', periode: 'Juin 2026', date: '2026-06-12', type: 'Vente'      },
  { id: '2', agent: 'Fatoumata Bah',    montant: 180_000, statut: 'payee',      periode: 'Juin 2026', date: '2026-06-11', type: 'Livraison'  },
  { id: '3', agent: 'Ibrahima Camara',  montant: 320_000, statut: 'en_attente', periode: 'Juin 2026', date: '2026-06-11', type: 'Vente'      },
  { id: '4', agent: 'Aissatou Diallo',  montant: 150_000, statut: 'payee',      periode: 'Mai 2026',  date: '2026-06-10', type: 'Vente'      },
  { id: '5', agent: 'Mamadou Keita',    montant: 410_000, statut: 'annulee',    periode: 'Mai 2026',  date: '2026-06-09', type: 'Production' },
];

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  en_attente: 'En attente',
  payee:      'Payée',
  annulee:    'Annulée',
};
