import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import { secureStorage } from '../services/secure-storage.service';

export function useLogout() {
  const [loading, setLoading] = useState(false);

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
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  }, []);

  return { logout, loading };
}
