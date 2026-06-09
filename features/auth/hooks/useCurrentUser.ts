import { useEffect, useState } from 'react';
import { secureStorage } from '../services/secure-storage.service';
import type { AuthUser } from '../types/auth.types';

export function useCurrentUser() {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    secureStorage.getUser<AuthUser>().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
