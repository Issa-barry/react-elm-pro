import { useCallback, useState } from 'react';
import { router } from 'expo-router';

import { DEFAULT_COUNTRY, buildE164, type LoginInput } from '../types/auth.types';
import { validateLogin } from '../validation/auth.validation';
import { authService } from '../services/auth.service';
import { secureStorage } from '../services/secure-storage.service';
import { registerPushNotifications } from '@/features/notifications/services/notification.service';

interface LoginState {
  codePays: string;
  prefix: string;
  telephoneLocal: string;
  password: string;
  loading: boolean;
  errors: Record<string, string>;
  globalError: string;
  errorCode: string;
}

const INITIAL: LoginState = {
  codePays:       DEFAULT_COUNTRY.code,
  prefix:         DEFAULT_COUNTRY.prefix,
  telephoneLocal: '',
  password:       '',
  loading:        false,
  errors:         {},
  globalError:    '',
  errorCode:      '',
};

export function useLogin() {
  const [state, setState] = useState<LoginState>(INITIAL);

  const set = useCallback(<K extends keyof LoginState>(key: K, value: LoginState[K]) => {
    setState(prev => ({ ...prev, [key]: value, errors: { ...prev.errors, [key]: '' }, globalError: '', errorCode: '' }));
  }, []);

  const setCountry = useCallback((code: string, prefix: string) => {
    setState(prev => ({ ...prev, codePays: code, prefix, telephoneLocal: '' }));
  }, []);

  const submit = useCallback(async () => {
    const input: LoginInput = {
      codePays:       state.codePays,
      telephoneLocal: state.telephoneLocal,
      telephone:      buildE164(state.prefix, state.telephoneLocal),
      password:       state.password,
    };

    const { valid, errors } = validateLogin(input);
    if (!valid) { setState(prev => ({ ...prev, errors })); return; }

    setState(prev => ({ ...prev, loading: true, globalError: '' }));
    const result = await authService.login(input);
    setState(prev => ({ ...prev, loading: false }));

    if (!result.ok) {
      setState(prev => ({ ...prev, globalError: result.error, errorCode: result.code ?? '' }));
      return;
    }

    await secureStorage.saveToken(result.data.token);
    await secureStorage.saveUser(result.data.user);
    router.replace('/(tabs)');
    registerPushNotifications().catch(console.warn);
  }, [state]);

  return { state, set, setCountry, submit };
}
