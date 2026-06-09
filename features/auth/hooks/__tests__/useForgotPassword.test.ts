import { act, renderHook } from '@testing-library/react-native';
import { useForgotPassword } from '../useForgotPassword';
import { authService } from '../../services/auth.service';
import { secureStorage } from '../../services/secure-storage.service';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('../../services/auth.service', () => ({
  authService: {
    forgotLookup:      jest.fn(),
    forgotVerifyOtp:   jest.fn(),
    resetPassword:     jest.fn(),
    login:             jest.fn(),
  },
}));

jest.mock('../../services/secure-storage.service', () => ({
  secureStorage: {
    saveToken: jest.fn(),
    saveUser:  jest.fn(),
  },
}));

const mockForgotLookup    = authService.forgotLookup    as jest.MockedFunction<typeof authService.forgotLookup>;
const mockForgotVerifyOtp = authService.forgotVerifyOtp as jest.MockedFunction<typeof authService.forgotVerifyOtp>;
const mockResetPassword   = authService.resetPassword   as jest.MockedFunction<typeof authService.resetPassword>;
const mockLogin           = authService.login           as jest.MockedFunction<typeof authService.login>;
const mockSaveToken       = secureStorage.saveToken     as jest.MockedFunction<typeof secureStorage.saveToken>;
const mockSaveUser        = secureStorage.saveUser      as jest.MockedFunction<typeof secureStorage.saveUser>;

describe('useForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── État initial ─────────────────────────────────────────────────────────────

  it('démarre à l\'étape phone avec les valeurs initiales', () => {
    const { result } = renderHook(() => useForgotPassword());
    expect(result.current.state.step).toBe('phone');
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.telephoneLocal).toBe('');
    expect(result.current.state.errors).toEqual({});
  });

  // ── set() ────────────────────────────────────────────────────────────────────

  it('set() met à jour un champ et efface son erreur', () => {
    const { result } = renderHook(() => useForgotPassword());
    act(() => { result.current.set('telephoneLocal', '621234567'); });
    expect(result.current.state.telephoneLocal).toBe('621234567');
    expect(result.current.state.errors.telephoneLocal).toBe('');
  });

  // ── setCountry() ─────────────────────────────────────────────────────────────

  it('setCountry() met à jour le pays et remet telephoneLocal à vide', () => {
    const { result } = renderHook(() => useForgotPassword());
    act(() => {
      result.current.set('telephoneLocal', '12345');
      result.current.setCountry('SN', '+221');
    });
    expect(result.current.state.codePays).toBe('SN');
    expect(result.current.state.prefix).toBe('+221');
    expect(result.current.state.telephoneLocal).toBe('');
  });

  // ── submit() — étape phone ────────────────────────────────────────────────────

  it('submit() à l\'étape phone avec un numéro invalide → définit une erreur', async () => {
    const { result } = renderHook(() => useForgotPassword());

    await act(async () => { await result.current.submit(); });

    expect(result.current.state.errors.telephoneLocal).toBeTruthy();
    expect(mockForgotLookup).not.toHaveBeenCalled();
  });

  it('submit() à l\'étape phone avec un numéro valide → appelle forgotLookup et passe à otp', async () => {
    mockForgotLookup.mockResolvedValue({ ok: true, data: { message: 'Code envoyé.', masked_email: 'm***@test.com' } });
    const { result } = renderHook(() => useForgotPassword());

    act(() => {
      result.current.set('telephoneLocal', '621234567');
    });

    await act(async () => { await result.current.submit(); });

    expect(mockForgotLookup).toHaveBeenCalledWith('+224621234567');
    expect(result.current.state.step).toBe('otp');
    expect(result.current.state.maskedEmail).toBe('m***@test.com');
  });

  it('submit() à l\'étape phone → globalError si forgotLookup échoue', async () => {
    mockForgotLookup.mockResolvedValue({ ok: false, error: 'Numéro introuvable.' });
    const { result } = renderHook(() => useForgotPassword());

    act(() => { result.current.set('telephoneLocal', '621234567'); });
    await act(async () => { await result.current.submit(); });

    expect(result.current.state.globalError).toBe('Numéro introuvable.');
    expect(result.current.state.step).toBe('phone');
  });

  // ── submit() — étape otp ──────────────────────────────────────────────────────

  it('submit() à l\'étape otp avec un code invalide → définit une erreur', async () => {
    mockForgotLookup.mockResolvedValue({ ok: true, data: { message: 'OK', masked_email: 'm***@test.com' } });
    const { result } = renderHook(() => useForgotPassword());

    act(() => { result.current.set('telephoneLocal', '621234567'); });
    await act(async () => { await result.current.submit(); }); // → otp

    act(() => { result.current.set('otp', 'abc'); });
    await act(async () => { await result.current.submit(); });

    expect(result.current.state.errors.otp).toBeTruthy();
    expect(mockForgotVerifyOtp).not.toHaveBeenCalled();
  });

  it('submit() à l\'étape otp avec un code valide → appelle forgotVerifyOtp et passe à new_password', async () => {
    mockForgotLookup.mockResolvedValue({ ok: true, data: { message: 'OK', masked_email: 'm***@test.com' } });
    mockForgotVerifyOtp.mockResolvedValue({ ok: true, data: { verified: true } });
    const { result } = renderHook(() => useForgotPassword());

    act(() => { result.current.set('telephoneLocal', '621234567'); });
    await act(async () => { await result.current.submit(); }); // → otp

    act(() => { result.current.set('otp', '12345'); });
    await act(async () => { await result.current.submit(); }); // → new_password

    expect(mockForgotVerifyOtp).toHaveBeenCalled();
    expect(result.current.state.step).toBe('new_password');
  });

  // ── submit() — étape new_password ─────────────────────────────────────────────

  it('submit() à l\'étape new_password → erreur si mots de passe différents', async () => {
    mockForgotLookup.mockResolvedValue({ ok: true, data: { message: 'OK', masked_email: 'm***@test.com' } });
    mockForgotVerifyOtp.mockResolvedValue({ ok: true, data: { verified: true } });
    const { result } = renderHook(() => useForgotPassword());

    act(() => { result.current.set('telephoneLocal', '621234567'); });
    await act(async () => { await result.current.submit(); }); // phone → otp
    act(() => { result.current.set('otp', '12345'); });
    await act(async () => { await result.current.submit(); }); // otp → new_password

    act(() => {
      result.current.set('password', 'NewPass1!');
      result.current.set('passwordConfirmation', 'Different1!');
    });
    await act(async () => { await result.current.submit(); });

    expect(result.current.state.errors.passwordConfirmation).toBeTruthy();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('submit() à l\'étape new_password → appelle resetPassword et passe à done', async () => {
    mockForgotLookup.mockResolvedValue({ ok: true, data: { message: 'OK', masked_email: 'm***@test.com' } });
    mockForgotVerifyOtp.mockResolvedValue({ ok: true, data: { verified: true } });
    mockResetPassword.mockResolvedValue({ ok: true, data: { message: 'Réinitialisé.' } });
    const { result } = renderHook(() => useForgotPassword());

    act(() => { result.current.set('telephoneLocal', '621234567'); });
    await act(async () => { await result.current.submit(); });
    act(() => { result.current.set('otp', '12345'); });
    await act(async () => { await result.current.submit(); });
    act(() => {
      result.current.set('password', 'NewPass1!');
      result.current.set('passwordConfirmation', 'NewPass1!');
    });
    await act(async () => { await result.current.submit(); });

    expect(mockResetPassword).toHaveBeenCalled();
    expect(result.current.state.step).toBe('done');
  });

  // ── autoLogin() ───────────────────────────────────────────────────────────────

  it('autoLogin() connecte l\'utilisateur et navigue vers (tabs)', async () => {
    const { router } = require('expo-router');
    mockLogin.mockResolvedValue({
      ok: true,
      data: { token: 'tok-123', user: { id: 'u1', prenom: 'Moussa', nom: 'CAMARA', telephone: '+224621234567', roles: ['client'] } },
    });
    mockSaveToken.mockResolvedValue(undefined);
    mockSaveUser.mockResolvedValue(undefined);

    const { result } = renderHook(() => useForgotPassword());
    await act(async () => { await result.current.autoLogin(); });

    expect(mockLogin).toHaveBeenCalled();
    expect(mockSaveToken).toHaveBeenCalledWith('tok-123');
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('autoLogin() définit autoLoginError en cas d\'échec', async () => {
    mockLogin.mockResolvedValue({ ok: false, error: 'Identifiants incorrects.' });
    const { result } = renderHook(() => useForgotPassword());

    await act(async () => { await result.current.autoLogin(); });

    expect(result.current.state.autoLoginError).toBe('Identifiants incorrects.');
    expect(result.current.state.autoLoginLoading).toBe(false);
  });
});
