// ── Mode MOCK (pas de BASE_URL) ───────────────────────────────────────────────
import { authService } from '../auth.service';

describe('authService – mode mock', () => {
  function runWithFakeTimers(fn: () => Promise<void>) {
    return async () => {
      jest.useFakeTimers();
      try {
        await fn();
      } finally {
        jest.useRealTimers();
      }
    };
  }

  function advance() { jest.advanceTimersByTime(1500); }

  it('checkPhone retourne { status: "not_found" }', runWithFakeTimers(async () => {
    const p = authService.checkPhone('+224621234567');
    advance();
    const result = await p;
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.status).toBe('not_found');
  }));

  it('register retourne un utilisateur pending', runWithFakeTimers(async () => {
    const data = {
      codePays: 'GN', prefix: '+224', telephoneLocal: '621234567',
      telephone: '+224621234567', prenom: 'Moussa', nom: 'Camara',
      prefilled: false, email: 'moussa@test.com',
      password: 'Test@1234', passwordConfirmation: 'Test@1234',
    };
    const p = authService.register(data);
    advance();
    const result = await p;
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.user.status).toBe('pending');
      expect(result.data.user.prenom).toBe('Moussa');
      expect(result.data.user.nom).toBe('CAMARA');
    }
  }));

  it('login avec le bon mot de passe retourne un token', runWithFakeTimers(async () => {
    const p = authService.login({ codePays: 'GN', telephoneLocal: '621234567', telephone: '+224621234567', password: 'Test@1234' });
    advance();
    const result = await p;
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.token).toBeTruthy();
  }));

  it('login avec un mauvais mot de passe retourne une erreur', runWithFakeTimers(async () => {
    const p = authService.login({ codePays: 'GN', telephoneLocal: '621234567', telephone: '+224621234567', password: 'Mauvais' });
    advance();
    const result = await p;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Identifiants incorrects.');
  }));

  it('forgotLookup retourne un masked_email', runWithFakeTimers(async () => {
    const p = authService.forgotLookup('+224621234567');
    advance();
    const result = await p;
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.masked_email).toBeTruthy();
  }));

  it('forgotVerifyOtp avec le bon code retourne verified: true', runWithFakeTimers(async () => {
    const p = authService.forgotVerifyOtp('+224621234567', '12345');
    advance();
    const result = await p;
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.verified).toBe(true);
  }));

  it('forgotVerifyOtp avec un mauvais code retourne une erreur', runWithFakeTimers(async () => {
    const p = authService.forgotVerifyOtp('+224621234567', '99999');
    advance();
    const result = await p;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Code incorrect. Vérifiez et réessayez.');
  }));

  it('resetPassword retourne un message de succès', runWithFakeTimers(async () => {
    const p = authService.resetPassword('+224621234567', 'NewPass1!', 'NewPass1!');
    advance();
    const result = await p;
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.message).toBeTruthy();
  }));
});

// ── Mode API (BASE_URL présent) ───────────────────────────────────────────────
describe('authService – mode API', () => {
  let svc: typeof authService;

  beforeAll(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
    jest.resetModules();
    svc = require('../auth.service').authService;
  });

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.resetModules();
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('checkPhone appelle POST /api/auth/register/check-phone', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, json: async () => ({ status: 'user_exists' }),
    });
    const result = await svc.checkPhone('+224621234567');
    expect(result.ok).toBe(true);
    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/api/auth/register/check-phone');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ telephone: '+224621234567' });
  });

  it('login appelle POST /api/auth/login avec device_name', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, json: async () => ({ token: 'tok', user: {} }),
    });
    await svc.login({ codePays: 'GN', telephoneLocal: '621234567', telephone: '+224621234567', password: 'Pass1!' });
    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/api/auth/login');
    expect(JSON.parse(opts.body).device_name).toBe('EauLaMaman-Mobile');
  });

  it('retourne ok:false avec le message serveur si !res.ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, json: async () => ({ message: 'Non autorisé.', code: 'AUTH_FAILED' }),
    });
    const result = await svc.checkPhone('+224621234567');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Non autorisé.');
      expect(result.code).toBe('AUTH_FAILED');
    }
  });

  it('retourne ok:false sur exception réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    const result = await svc.login({ codePays: 'GN', telephoneLocal: '621234567', telephone: '+224621234567', password: 'P' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Connexion impossible. Vérifiez votre réseau.');
  });

  it('retourne ok:false avec message timeout si AbortError', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    (global.fetch as jest.Mock).mockRejectedValue(abortError);
    const result = await svc.checkPhone('+224621234567');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Délai dépassé. Vérifiez votre connexion.');
  });

  it('register appelle POST /api/auth/register', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, json: async () => ({ message: 'OK', user: { id: '1', prenom: 'M', nom: 'C', email: 'a@b.com', status: 'pending', is_active: false } }),
    });
    const data = {
      codePays: 'GN', prefix: '+224', telephoneLocal: '621234567',
      telephone: '+224621234567', prenom: 'Moussa', nom: 'Camara',
      prefilled: false, email: 'moussa@test.com',
      password: 'Test@1234', passwordConfirmation: 'Test@1234',
    };
    const result = await svc.register(data);
    expect(result.ok).toBe(true);
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/api/auth/register');
  });
});
