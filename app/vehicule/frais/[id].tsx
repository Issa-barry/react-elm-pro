import { Stack, useLocalSearchParams } from 'expo-router';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { HeaderBackButton } from '@/shared/components/HeaderBackButton';
import VehiculeFraisScreen from '@/features/vehicule/screens/VehiculeFraisScreen';

export default function VehiculeFraisRoute() {
  const { id, nom, immatriculation } = useLocalSearchParams<{
    id: string;
    nom: string;
    immatriculation: string;
  }>();

  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title:            nom ?? 'Frais',
          headerLeft:       () => <HeaderBackButton />,
          headerBackVisible: false,
          headerStyle:      { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.text },
          headerTintColor:  colors.primary,
        }}
      />
      <VehiculeFraisScreen
        id={id ?? ''}
        nom={nom ?? ''}
        immatriculation={immatriculation ?? ''}
      />
    </>
  );
}
