import { useCallback, useState } from 'react';
import { router } from 'expo-router';

import { DEFAULT_COUNTRY, buildE164, type ForgotStep } from '../types/auth.types';
import { validateOtp, validatePassword, validatePhone } from '../validation/auth.validation';
import { authService } from '../services/auth.service';
import { secureStorage } from '../services/secure-storage.service';

interface ForgotState {
  step: ForgotStep;
  codePays: string;
  prefix: string;
  telephoneLocal: string;
  telephone: string;
  maskedEmail: string;
  otp: string;
  password: string;
  passwordConfirmation: string;
  loading: boolean;
  errors: Record<string, string>;
  globalError: string;
  autoLoginLoading: boolean;
  autoLoginError: string;
}

const INITIAL: ForgotState = {
  step:                 'phone',
  codePays:             DEFAULT_COUNTRY.code,
  prefix:               DEFAULT_COUNTRY.prefix,
  telephoneLocal:       '',
  telephone:            '',
  maskedEmail:          '',
  otp:                  '',
  password:             '',
  passwordConfirmation: '',
  loading:              false,
  errors:               {},
  globalError:          '',
  autoLoginLoading:     false,
  autoLoginError:       '',
};

function err(setState: React.Dispatch<React.SetStateAction<ForgotState>>, errors: Record<string, string>) {
  setState(prev => ({ ...prev, loading: false, errors }));
}

function globalErr(setState: React.Dispatch<React.SetStateAction<ForgotState>>, globalError: string) {
  setState(prev => ({ ...prev, loading: false, globalError }));
}

export function useForgotPassword() {
  const [state, setState] = useState<ForgotState>(INITIAL);

  const set = useCallback(<K extends keyof ForgotState>(key: K, value: ForgotState[K]) => {
    setState(prev => ({ ...prev, [key]: value, errors: { ...prev.errors, [key]: '' }, globalError: '' }));
  }, []);

  const setCountry = useCallback((code: string, prefix: string) => {
    setState(prev => ({ ...prev, codePays: code, prefix, telephoneLocal: '' }));
  }, []);

  const submitPhone = useCallback(async () => {
    const phoneErr = validatePhone(state.telephoneLocal, state.codePays);
    if (phoneErr) { err(setState, { telephoneLocal: phoneErr }); return; }

    const telephone = buildE164(state.prefix, state.telephoneLocal);
    const result = await authService.forgotLookup(telephone);
    if (!result.ok) { globalErr(setState, result.error); return; }
    setState(prev => ({ ...prev, loading: false, telephone, maskedEmail: result.data.masked_email, step: 'otp' }));
  }, [state.codePays, state.prefix, state.telephoneLocal]);

  const submitOtp = useCallback(async () => {
    const otpErr = validateOtp(state.otp);
    if (otpErr) { err(setState, { otp: otpErr }); return; }

    const result = await authService.forgotVerifyOtp(state.telephone, state.otp);
    if (!result.ok) { globalErr(setState, result.error); return; }
    setState(prev => ({ ...prev, loading: false, step: 'new_password' }));
  }, [state.otp, state.telephone]);

  const submitNewPassword = useCallback(async () => {
    const errors: Record<string, string> = {};
    const pwdErr = validatePassword(state.password);
    if (pwdErr) errors.password = pwdErr;
    if (state.password !== state.passwordConfirmation)
      errors.passwordConfirmation = 'Les mots de passe ne correspondent pas.';
    if (Object.keys(errors).length > 0) { err(setState, errors); return; }

    const result = await authService.resetPassword(state.telephone, state.password, state.passwordConfirmation);
    if (!result.ok) { globalErr(setState, result.error); return; }
    setState(prev => ({ ...prev, loading: false, step: 'done' }));
  }, [state.password, state.passwordConfirmation, state.telephone]);

  const submit = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, errors: {}, globalError: '' }));
    if (state.step === 'phone')             await submitPhone();
    else if (state.step === 'otp')          await submitOtp();
    else if (state.step === 'new_password') await submitNewPassword();
  }, [state.step, submitPhone, submitOtp, submitNewPassword]);

  const autoLogin = useCallback(async () => {
    setState(prev => ({ ...prev, autoLoginLoading: true, autoLoginError: '' }));

    const result = await authService.login({
      codePays:       '',
      telephoneLocal: '',
      telephone:      state.telephone,
      password:       state.password,
    });

    if (!result.ok) {
      setState(prev => ({ ...prev, autoLoginLoading: false, autoLoginError: result.error }));
      return;
    }

    await secureStorage.saveToken(result.data.token);
    await secureStorage.saveUser(result.data.user);
    router.replace('/(tabs)');
  }, [state.telephone, state.password]);

  return { state, set, setCountry, submit, autoLogin };
}
