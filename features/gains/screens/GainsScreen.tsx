import { StyleSheet } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';

export default function GainsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Gains</ThemedText>
      <ThemedText>Vos gains apparaîtront ici.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
});
