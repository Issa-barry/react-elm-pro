jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('@/features/auth/services/auth.service', () => ({
  authService: { login: jest.fn() },
}));

jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: {
    saveToken: jest.fn().mockResolvedValue(undefined),
    saveUser: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/features/notifications/services/notification.service', () => ({
  registerPushNotifications: jest.fn().mockResolvedValue(undefined),
}));

import { renderHook, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useLogin } from '../useLogin';
import { authService } from '@/features/auth/services/auth.service';
import { secureStorage } from '@/features/auth/services/secure-storage.service';

const mockLogin = authService.login as jest.MockedFunction<typeof authService.login>;

describe('useLogin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('état initial correct', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.globalError).toBe('');
    expect(result.current.state.telephoneLocal).toBe('');
  });

  it('set() met à jour un champ et efface son erreur', () => {
    const { result } = renderHook(() => useLogin());
    act(() => { result.current.set('telephoneLocal', '620000000'); });
    expect(result.current.state.telephoneLocal).toBe('620000000');
    expect(result.current.state.errors.telephoneLocal).toBe('');
  });

  it('setCountry() met à jour le pays, le préfixe et vide le numéro local', () => {
    const { result } = renderHook(() => useLogin());
    act(() => { result.current.setCountry('SN', '+221'); });
    expect(result.current.state.codePays).toBe('SN');
    expect(result.current.state.prefix).toBe('+221');
    expect(result.current.state.telephoneLocal).toBe('');
  });

  it('submit() affiche des erreurs de validation si les champs sont vides', async () => {
    const { result } = renderHook(() => useLogin());
    await act(async () => { await result.current.submit(); });
    expect(result.current.state.errors.telephoneLocal).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submit() connecte et redirige vers les tabs si login réussit', async () => {
    mockLogin.mockResolvedValue({
      ok: true,
      data: {
        token: 'test-token',
        user: {
          id: '1',
          prenom: 'Jean',
          nom: 'Test',
          telephone: '+224620000000',
          roles: ['livreur'],
        } as any,
      },
    });

    const { result } = renderHook(() => useLogin());
    await act(async () => {
      result.current.set('telephoneLocal', '620000000');
      result.current.set('password', 'Password1!');
    });
    await act(async () => { await result.current.submit(); });

    expect(mockLogin).toHaveBeenCalled();
    expect(secureStorage.saveToken).toHaveBeenCalledWith('test-token');
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('submit() affiche une erreur globale si login échoue', async () => {
    mockLogin.mockResolvedValue({
      ok: false,
      error: 'Identifiants incorrects',
      code: 'INVALID_CREDENTIALS',
    });

    const { result } = renderHook(() => useLogin());
    await act(async () => {
      result.current.set('telephoneLocal', '620000000');
      result.current.set('password', 'Password1!');
    });
    await act(async () => { await result.current.submit(); });

    expect(result.current.state.globalError).toBe('Identifiants incorrects');
    expect(result.current.state.errorCode).toBe('INVALID_CREDENTIALS');
  });
});
