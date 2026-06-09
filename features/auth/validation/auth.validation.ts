import {
  COUNTRIES,
  type LoginInput,
  type RegisterStep1Data,
  type RegisterStep2Data,
  type RegisterStep3Data,
} from '../types/auth.types';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// ─── Règles mot de passe (miroir de Password::default() du monolithe) ────────
const SPECIAL = /[!@#$%^&*()\-_=+[\]{};':",.<>/?\\|`~]/;

export function validatePassword(value: string): string | null {
  if (!value)                return 'Le mot de passe est requis.';
  if (value.length < 8)     return 'Minimum 8 caractères.';
  if (!/[A-Z]/.test(value)) return 'Au moins une lettre majuscule.';
  if (!/[a-z]/.test(value)) return 'Au moins une lettre minuscule.';
  if (!/\d/.test(value))    return 'Au moins un chiffre.';
  if (!SPECIAL.test(value)) return 'Au moins un caractère spécial.';
  return null;
}

// ─── Email ────────────────────────────────────────────────────────────────────
export function validateEmail(value: string): string | null {
  if (!value?.trim()) return "L'adresse email est obligatoire.";
  const trimmed = value.trim();
  if (trimmed.startsWith('.')) return "L'email ne peut pas commencer par un point.";
  const re = /^[^\s@.][^\s@]*@[^\s@]+\.[^\s@]+$/;
  if (!re.test(trimmed)) return "L'adresse email n'est pas valide.";
  return null;
}

// ─── Téléphone ────────────────────────────────────────────────────────────────
export function validatePhone(telephoneLocal: string, codePays: string): string | null {
  const country = COUNTRIES.find(c => c.code === codePays);
  if (!telephoneLocal)               return 'Le numéro de téléphone est requis.';
  if (!/^\d+$/.test(telephoneLocal)) return 'Chiffres uniquement.';
  if (country) {
    const normalized = telephoneLocal.replace(/^0/, '');
    if (normalized.length !== country.digits) {
      return `${country.digits} chiffres requis pour ${country.name} (sans le 0 initial).`;
    }
  }
  return null;
}

// ─── Étape 1 : téléphone ─────────────────────────────────────────────────────
export function validateStep1(data: RegisterStep1Data): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.codePays) errors.codePays = 'Sélectionnez un pays.';
  const phoneErr = validatePhone(data.telephoneLocal, data.codePays);
  if (phoneErr) errors.telephoneLocal = phoneErr;
  return { valid: Object.keys(errors).length === 0, errors };
}

// ─── Étape 2 : identité ──────────────────────────────────────────────────────
export function validateStep2(data: RegisterStep2Data): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.prenom || data.prenom.trim().length < 2)
    errors.prenom = 'Prénom requis (min. 2 caractères).';
  if (!data.nom || data.nom.trim().length < 2)
    errors.nom = 'Nom requis (min. 2 caractères).';
  return { valid: Object.keys(errors).length === 0, errors };
}

// ─── Étape 3 : email ─────────────────────────────────────────────────────────
export function validateStep3(data: RegisterStep3Data): ValidationResult {
  const errors: Record<string, string> = {};
  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;
  const pwdErr = validatePassword(data.password);
  if (pwdErr) errors.password = pwdErr;
  if (data.password !== data.passwordConfirmation)
    errors.passwordConfirmation = 'Les mots de passe ne correspondent pas.';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStepEmail(email: string): ValidationResult {
  const errors: Record<string, string> = {};
  const err = validateEmail(email);
  if (err) errors.email = err;
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStepPassword(password: string, passwordConfirmation: string): ValidationResult {
  const errors: Record<string, string> = {};
  const err = validatePassword(password);
  if (err) errors.password = err;
  if (password !== passwordConfirmation)
    errors.passwordConfirmation = 'Les mots de passe ne correspondent pas.';
  return { valid: Object.keys(errors).length === 0, errors };
}

// ─── OTP ─────────────────────────────────────────────────────────────────────
export function validateOtp(value: string): string | null {
  if (!value || value.trim().length === 0) return 'Le code est requis.';
  if (!/^\d{5}$/.test(value.trim()))       return 'Le code doit contenir exactement 5 chiffres.';
  return null;
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function validateLogin(data: LoginInput): ValidationResult {
  const errors: Record<string, string> = {};
  const phoneErr = validatePhone(data.telephoneLocal, data.codePays);
  if (phoneErr) errors.telephoneLocal = phoneErr;
  if (!data.password) errors.password = 'Le mot de passe est requis.';
  return { valid: Object.keys(errors).length === 0, errors };
}
