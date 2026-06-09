jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { clear: jest.fn().mockResolvedValue(undefined) },
}));

import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { secureStorage } from '@/features/auth/services/secure-storage.service';
import { useLogout } from '../useLogout';

describe('useLogout', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('état initial: loading=false', () => {
    const { result } = renderHook(() => useLogout());
    expect(result.current.loading).toBe(false);
  });

  it('appelle Alert.alert quand logout() est invoqué', () => {
    const { result } = renderHook(() => useLogout());
    act(() => { result.current.logout(); });
    expect(alertSpy).toHaveBeenCalledWith(
      'Déconnexion',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('efface le storage et redirige vers login quand l\'utilisateur confirme', async () => {
    const { result } = renderHook(() => useLogout());
    act(() => { result.current.logout(); });

    const alertCall = alertSpy.mock.calls[0];
    const buttons = alertCall[2] as Array<{ text: string; onPress?: () => void }>;
    const confirmBtn = buttons.find(b => b.text === 'Se déconnecter');

    await act(async () => { await confirmBtn?.onPress?.(); });

    expect(secureStorage.clear).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
  });
});
