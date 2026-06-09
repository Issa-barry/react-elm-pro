import { Stack } from 'expo-router';
import ScannerScreen from '@/features/scan/screens/ScannerScreen';

export default function ScanRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScannerScreen />
    </>
  );
}
