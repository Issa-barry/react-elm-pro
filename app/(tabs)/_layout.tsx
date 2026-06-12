import { Tabs } from 'expo-router';

import { HapticTab } from '@/shared/components/haptic-tab';
import { IconSymbol } from '@/shared/components/ui/icon-symbol';
import { useTheme } from '@/shared/contexts/ThemeContext';

function IconAccueil({ color }: Readonly<{ color: string }>) {
  return <IconSymbol size={28} name="house.fill" color={color} />;
}

function IconDashboard({ color }: Readonly<{ color: string }>) {
  return <IconSymbol size={28} name="chart.bar.fill" color={color} />;
}

function IconNotifications({ color }: Readonly<{ color: string }>) {
  return <IconSymbol size={28} name="bell.fill" color={color} />;
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        headerShown:             false,
        tabBarButton:            HapticTab,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor:  colors.border,
          borderTopWidth:  1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Accueil', tabBarIcon: IconAccueil }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Tableau de bord', tabBarIcon: IconDashboard }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ title: 'Notifications', tabBarIcon: IconNotifications }}
      />
      <Tabs.Screen
        name="logistique"
        options={{ href: null }}
      />
    </Tabs>
  );
}
