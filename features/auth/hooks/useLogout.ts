import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { secureStorage } from '../services/secure-storage.service';
import { useAuth } from '../contexts/AuthContext';

export function useLogout() {
  const [loading, setLoading] = useState(false);
  const { signOut } = useAuth();

  const logout = useCallback(() => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await secureStorage.clear();
            setLoading(false);
            signOut();
          },
        },
      ],
    );
  }, [signOut]);

  return { logout, loading };
}
