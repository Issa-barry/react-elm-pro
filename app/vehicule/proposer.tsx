import { useMemo } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { HeaderBackButton } from '@/shared/components/HeaderBackButton';

export default function ProposerVehiculeRoute() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <>
      <Stack.Screen options={{
        title: 'Proposer un véhicule',
        headerLeft: () => <HeaderBackButton />,
        headerBackVisible: false,
        headerStyle:      { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        headerTintColor:  colors.primary,
      }} />
      <View style={styles.container}>
        <Text style={styles.icon}>🚚</Text>
        <Text style={styles.titre}>Formulaire à venir</Text>
        <Text style={styles.desc}>
          Cette section permettra de soumettre une demande de véhicule à l&apos;équipe Eau la maman.
        </Text>
      </View>
    </>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 12,
    },
    icon:  { fontSize: 48 },
    titre: { fontSize: 18, fontWeight: '700', color: colors.text },
    desc:  { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  });
}
