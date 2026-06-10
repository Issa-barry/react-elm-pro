import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { secureStorage } from '../services/secure-storage.service';

interface AuthContextValue {
  isAuthenticated: boolean;
  ready: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  ready: false,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    secureStorage.getToken().then(token => {
      setIsAuthenticated(!!token);
      setReady(true);
    });
  }, []);

  const signIn = useCallback(() => setIsAuthenticated(true), []);
  const signOut = useCallback(() => setIsAuthenticated(false), []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, ready, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
