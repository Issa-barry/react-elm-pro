import type {
  ApiResult,
  FullRegisterData,
  ForgotLookupResponse,
  LoginInput,
  LoginResponse,
  LookupResponse,
  RegisterPendingResponse,
} from '../types/auth.types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const USE_MOCK = !BASE_URL;

// ─── Helper POST ──────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 480_000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.message ?? json.error ?? 'Erreur serveur.', code: json.code };
    return { ok: true, data: json as T };
  } catch (e: unknown) {
    clearTimeout(timer);
    const isTimeout = e instanceof Error && e.name === 'AbortError';
    return { ok: false, error: isTimeout ? 'Délai dépassé. Vérifiez votre connexion.' : 'Connexion impossible. Vérifiez votre réseau.' };
  }
}

// ─── Mocks développement ──────────────────────────────────────────────────────

const MOCK_TOKEN = 'mock-dev-token-xxxx';

function sleep(ms = 800) { return new Promise<void>(r => setTimeout(r, ms)); }

// ─── Service ──────────────────────────────────────────────────────────────────

export const authService = {

  /** Étape 1 : vérifie si le numéro existe et retourne les données de pré-remplissage */
  async checkPhone(telephone: string): Promise<ApiResult<LookupResponse>> {
    if (USE_MOCK) {
      await sleep();
      return { ok: true, data: { status: 'not_found' } };
    }
    return post('/api/auth/register/check-phone', { telephone });
  },

  /** Crée le compte (statut pending) — retourne message + user sans token */
  async register(data: FullRegisterData): Promise<ApiResult<RegisterPendingResponse>> {
    if (USE_MOCK) {
      await sleep(1000);
      return {
        ok: true,
        data: {
          message: 'Compte créé. Vérifiez votre email.',
          user: {
            id: 'mock-001',
            prenom: data.prenom,
            nom: data.nom.toUpperCase(),
            email: data.email,
            status: 'pending',
            is_active: false,
          },
        },
      };
    }
    return post('/api/auth/register', {
      telephone:             data.telephone,
      prenom:                data.prenom,
      nom:                   data.nom,
      email:                 data.email,
      password:              data.password,
      password_confirmation: data.passwordConfirmation,
    });
  },

  async login(input: LoginInput): Promise<ApiResult<LoginResponse>> {
    if (USE_MOCK) {
      await sleep();
      if (input.password === 'Test@1234') {
        return {
          ok: true,
          data: {
            token: MOCK_TOKEN,
            user: {
              id: 'mock-001',
              prenom: 'Moussa',
              nom: 'SIDIBÉ',
              telephone: input.telephone,
              roles: ['client'],
            },
          },
        };
      }
      return { ok: false, error: 'Identifiants incorrects.' };
    }
    return post<LoginResponse>('/api/auth/login', {
      telephone:   input.telephone,
      password:    input.password,
      device_name: 'EauLaMaman-Mobile',
    });
  },

  async forgotLookup(telephone: string): Promise<ApiResult<ForgotLookupResponse>> {
    if (USE_MOCK) {
      await sleep();
      return { ok: true, data: { message: 'Code envoyé.', masked_email: 'm***@example.com' } };
    }
    return post('/api/auth/password/lookup', { telephone });
  },

  async forgotVerifyOtp(telephone: string, code: string): Promise<ApiResult<{ verified: boolean }>> {
    if (USE_MOCK) {
      await sleep();
      if (code === '12345') return { ok: true, data: { verified: true } };
      return { ok: false, error: 'Code incorrect. Vérifiez et réessayez.' };
    }
    return post('/api/auth/password/verify', { telephone, code });
  },

  async resetPassword(telephone: string, password: string, passwordConfirmation: string): Promise<ApiResult<{ message: string }>> {
    if (USE_MOCK) {
      await sleep();
      return { ok: true, data: { message: 'Mot de passe réinitialisé avec succès.' } };
    }
    return post('/api/auth/password/reset', { telephone, password, password_confirmation: passwordConfirmation });
  },
};

export type { AuthSession } from '../types/auth.types';
