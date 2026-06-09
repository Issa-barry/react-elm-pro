export type UserRole = 'client' | 'livreur' | 'proprietaire' | 'admin_entreprise' | 'super_admin';

// ─── Pays supportés (aligné sur elm-monolithe PHONE_BY_COUNTRY) ────────────
export interface Country {
  code: string;
  prefix: string;
  name: string;
  digits: number;
}

export const COUNTRIES: Country[] = [
  { code: 'GN', prefix: '+224', name: 'Guinée',         digits: 9  },
  { code: 'SN', prefix: '+221', name: 'Sénégal',        digits: 9  },
  { code: 'ML', prefix: '+223', name: 'Mali',            digits: 8  },
  { code: 'CI', prefix: '+225', name: "Côte d'Ivoire",   digits: 10 },
  { code: 'GW', prefix: '+245', name: 'Guinée-Bissau',   digits: 7  },
  { code: 'LR', prefix: '+231', name: 'Liberia',         digits: 8  },
  { code: 'SL', prefix: '+232', name: 'Sierra Leone',    digits: 8  },
  { code: 'FR', prefix: '+33',  name: 'France',          digits: 9  },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Guinée

/** Compose un numéro E.164 : retire le 0 initial du numéro local si présent. */
export function buildE164(prefix: string, local: string): string {
  return `${prefix}${local.replace(/^0/, '')}`;
}

// ─── Session / utilisateur ──────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  email?: string;
  roles: UserRole[];
  qr_payload?: string | null;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

// ─── Login ──────────────────────────────────────────────────────────────────
export interface LoginInput {
  codePays: string;
  telephoneLocal: string;
  telephone: string;
  password: string;
}

// ─── Inscription (3 étapes) ─────────────────────────────────────────────────

/** Étape 1 : numéro de téléphone */
export interface RegisterStep1Data {
  codePays: string;
  prefix: string;
  telephoneLocal: string;
  telephone: string;
}

/** Étape 2 : identité (prenom / nom) */
export interface RegisterStep2Data {
  prenom: string;
  nom: string;
  prefilled: boolean;
}

/** Étape 3 : email + mot de passe */
export interface RegisterStep3Data {
  email: string;
  password: string;
  passwordConfirmation: string;
}

export type FullRegisterData =
  RegisterStep1Data &
  RegisterStep2Data &
  RegisterStep3Data;

// ─── Réponses API ────────────────────────────────────────────────────────────

export interface LookupResponse {
  status: 'user_exists' | 'prefill_available' | 'not_found';
  prefill?: { prenom: string; nom: string } | null;
}

/** Réponse après inscription réussie (compte en attente, pas de token) */
export interface RegisterPendingResponse {
  message: string;
  user: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    status: 'pending';
    is_active: false;
  };
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ─── Réinitialisation mot de passe ──────────────────────────────────────────
export type ForgotStep = 'phone' | 'otp' | 'new_password' | 'done';

export interface ForgotLookupResponse {
  message: string;
  masked_email: string;
}

export interface ForgotPasswordData {
  codePays: string;
  telephoneLocal: string;
  telephone: string;
  otp: string;
  password: string;
  passwordConfirmation: string;
}

// ─── Résultat API générique ──────────────────────────────────────────────────
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };
