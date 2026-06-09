import { act, renderHook } from '@testing-library/react-native';
import { useRegister } from '../useRegister';
import { authService } from '../../services/auth.service';

jest.mock('../../services/auth.service');

const mockAuth = authService as jest.Mocked<typeof authService>;

const PHONE_OK   = '621234567';
const TEL_E164   = '+224621234567';
const PRENOM_OK  = 'Moussa';
const NOM_OK     = 'CAMARA';
const EMAIL_OK   = 'moussa@example.com';
const PASS_OK    = 'Test@1234';

function makeHook() {
  return renderHook(() => useRegister());
}

// ─── État initial ─────────────────────────────────────────────────────────────

describe('useRegister — état initial', () => {
  it('démarre à l\'étape 1', () => {
    const { result } = makeHook();
    expect(result.current.state.step).toBe(1);
  });

  it('done est false', () => {
    const { result } = makeHook();
    expect(result.current.state.done).toBe(false);
  });

  it('les champs sont vides', () => {
    const { result } = makeHook();
    const { telephoneLocal, prenom, nom, email, password } = result.current.state;
    expect(telephoneLocal).toBe('');
    expect(prenom).toBe('');
    expect(nom).toBe('');
    expect(email).toBe('');
    expect(password).toBe('');
  });

  it('loading est false', () => {
    const { result } = makeHook();
    expect(result.current.state.loading).toBe(false);
  });
});

// ─── set() ────────────────────────────────────────────────────────────────────

describe('useRegister — set()', () => {
  it('met à jour telephoneLocal', () => {
    const { result } = makeHook();
    act(() => { result.current.set('telephoneLocal', PHONE_OK); });
    expect(result.current.state.telephoneLocal).toBe(PHONE_OK);
  });

  it('efface l\'erreur du champ modifié', () => {
    const { result } = makeHook();
    act(() => { result.current.set('prenom', ''); });
    act(() => { result.current.set('prenom', 'Moussa'); });
    expect(result.current.state.errors.prenom).toBeFalsy();
  });
});

// ─── back() ───────────────────────────────────────────────────────────────────

describe('useRegister — back()', () => {
  it('ne descend pas en dessous de l\'étape 1', () => {
    const { result } = makeHook();
    act(() => { result.current.back(); });
    expect(result.current.state.step).toBe(1);
  });

  it('revient de l\'étape 2 à 1', async () => {
    mockAuth.checkPhone.mockResolvedValue({ ok: true, data: { status: 'not_found' } });
    const { result } = makeHook();
    act(() => { result.current.set('telephoneLocal', PHONE_OK); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.step).toBe(2);
    act(() => { result.current.back(); });
    expect(result.current.state.step).toBe(1);
  });

  it('efface les erreurs au retour', async () => {
    mockAuth.checkPhone.mockResolvedValue({ ok: true, data: { status: 'not_found' } });
    const { result } = makeHook();
    act(() => { result.current.set('telephoneLocal', PHONE_OK); });
    await act(async () => { await result.current.next(); });
    act(() => { result.current.back(); });
    expect(result.current.state.errors).toEqual({});
    expect(result.current.state.globalError).toBe('');
  });
});

// ─── Étape 1 : téléphone ─────────────────────────────────────────────────────

describe('useRegister — étape 1 (téléphone)', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('next() sans téléphone n\'avance pas et produit une erreur', async () => {
    const { result } = makeHook();
    await act(async () => { await result.current.next(); });
    expect(result.current.state.step).toBe(1);
    expect(result.current.state.errors).toHaveProperty('telephoneLocal');
  });

  it('next() bloque si le numéro existe déjà', async () => {
    mockAuth.checkPhone.mockResolvedValue({ ok: true, data: { status: 'user_exists' } });
    const { result } = makeHook();
    act(() => { result.current.set('telephoneLocal', PHONE_OK); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.step).toBe(1);
    expect(result.current.state.globalError).toBeTruthy();
  });

  it('next() passe à l\'étape 2 si numéro valide et inexistant', async () => {
    mockAuth.checkPhone.mockResolvedValue({ ok: true, data: { status: 'not_found' } });
    const { result } = makeHook();
    act(() => { result.current.set('telephoneLocal', PHONE_OK); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.step).toBe(2);
  });

  it('pré-remplit prénom/nom si prefill_available', async () => {
    mockAuth.checkPhone.mockResolvedValue({
      ok: true,
      data: { status: 'prefill_available', prefill: { prenom: 'Ibra', nom: 'DIALLO' } },
    });
    const { result } = makeHook();
    act(() => { result.current.set('telephoneLocal', PHONE_OK); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.prenom).toBe('Ibra');
    expect(result.current.state.nom).toBe('DIALLO');
    expect(result.current.state.prefilled).toBe(true);
  });

  it('globalError si l\'API échoue', async () => {
    mockAuth.checkPhone.mockResolvedValue({ ok: false, error: 'Erreur réseau.' });
    const { result } = makeHook();
    act(() => { result.current.set('telephoneLocal', PHONE_OK); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.globalError).toBeTruthy();
    expect(result.current.state.step).toBe(1);
  });

  it('stocke le numéro E.164', async () => {
    mockAuth.checkPhone.mockResolvedValue({ ok: true, data: { status: 'not_found' } });
    const { result } = makeHook();
    act(() => { result.current.set('telephoneLocal', PHONE_OK); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.telephone).toBe(TEL_E164);
  });
});

// ─── Étape 2 : identité ───────────────────────────────────────────────────────

describe('useRegister — étape 2 (identité)', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  async function goToStep2() {
    mockAuth.checkPhone.mockResolvedValue({ ok: true, data: { status: 'not_found' } });
    const { result } = makeHook();
    act(() => { result.current.set('telephoneLocal', PHONE_OK); });
    await act(async () => { await result.current.next(); });
    return result;
  }

  it('next() sans prénom produit une erreur et reste en étape 2', async () => {
    const result = await goToStep2();
    act(() => { result.current.set('nom', NOM_OK); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.step).toBe(2);
    expect(result.current.state.errors).toHaveProperty('prenom');
  });

  it('next() avec prénom et nom valides avance à l\'étape 3', async () => {
    const result = await goToStep2();
    act(() => { result.current.set('prenom', PRENOM_OK); });
    act(() => { result.current.set('nom', NOM_OK); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.step).toBe(3);
  });
});

// ─── Étape 3 : email ─────────────────────────────────────────────────────────

describe('useRegister — étape 3 (email)', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  async function goToStep3() {
    mockAuth.checkPhone.mockResolvedValue({ ok: true, data: { status: 'not_found' } });
    const { result } = makeHook();
    act(() => { result.current.set('telephoneLocal', PHONE_OK); });
    await act(async () => { await result.current.next(); });
    act(() => { result.current.set('prenom', PRENOM_OK); });
    act(() => { result.current.set('nom', NOM_OK); });
    await act(async () => { await result.current.next(); });
    return result;
  }

  it('next() sans email produit une erreur et reste en étape 3', async () => {
    const result = await goToStep3();
    await act(async () => { await result.current.next(); });
    expect(result.current.state.step).toBe(3);
    expect(result.current.state.errors).toHaveProperty('email');
  });

  it('next() avec email valide avance à l\'étape 4', async () => {
    const result = await goToStep3();
    act(() => { result.current.set('email', EMAIL_OK); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.step).toBe(4);
  });
});

// ─── Étape 4 : mot de passe + inscription ────────────────────────────────────

describe('useRegister — étape 4 (mot de passe)', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  async function goToStep4() {
    mockAuth.checkPhone.mockResolvedValue({ ok: true, data: { status: 'not_found' } });
    const { result } = makeHook();
    act(() => { result.current.set('telephoneLocal', PHONE_OK); });
    await act(async () => { await result.current.next(); });
    act(() => { result.current.set('prenom', PRENOM_OK); });
    act(() => { result.current.set('nom', NOM_OK); });
    await act(async () => { await result.current.next(); });
    act(() => { result.current.set('email', EMAIL_OK); });
    await act(async () => { await result.current.next(); });
    return result;
  }

  it('next() sans mot de passe produit une erreur et reste en étape 4', async () => {
    const result = await goToStep4();
    await act(async () => { await result.current.next(); });
    expect(result.current.state.step).toBe(4);
    expect(result.current.state.errors).toHaveProperty('password');
  });

  it('next() si mots de passe différents produit une erreur', async () => {
    const result = await goToStep4();
    act(() => { result.current.set('password', PASS_OK); });
    act(() => { result.current.set('passwordConfirmation', 'Autre@5678'); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.errors).toHaveProperty('passwordConfirmation');
  });

  it('passe done=true si l\'inscription réussit', async () => {
    const result = await goToStep4();
    mockAuth.register.mockResolvedValue({
      ok: true,
      data: { message: 'OK', user: { id: '1', prenom: PRENOM_OK, nom: NOM_OK, email: EMAIL_OK, status: 'pending', is_active: false } },
    });
    act(() => { result.current.set('password', PASS_OK); });
    act(() => { result.current.set('passwordConfirmation', PASS_OK); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.done).toBe(true);
    expect(result.current.state.registeredEmail).toBe(EMAIL_OK);
  });

  it('globalError si l\'API d\'inscription échoue', async () => {
    const result = await goToStep4();
    mockAuth.register.mockResolvedValue({ ok: false, error: 'Email déjà utilisé.' });
    act(() => { result.current.set('password', PASS_OK); });
    act(() => { result.current.set('passwordConfirmation', PASS_OK); });
    await act(async () => { await result.current.next(); });
    expect(result.current.state.done).toBe(false);
    expect(result.current.state.globalError).toBeTruthy();
  });
});
