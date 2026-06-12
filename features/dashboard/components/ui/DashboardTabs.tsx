import { useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/contexts/ThemeContext';

export interface TabItem<K extends string = string> {
  key:   K;
  label: string;
}

interface Props<K extends string> {
  tabs:      TabItem<K>[];
  activeKey: K;
  onChange:  (key: K) => void;
}

export function DashboardTabs<K extends string>({ tabs, activeKey, onChange }: Props<K>) {
  const { colors } = useTheme();
  const styles     = useMemo(() => makeStyles(colors), [colors]);
  const scrollRef  = useRef<ScrollView>(null);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {tabs.map(tab => {
          const active = tab.key === activeKey;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, active && { color: colors.primary }]}>
                {tab.label}
              </Text>
              {active && <View style={[styles.indicator, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={[styles.border, { backgroundColor: colors.border }]} />
    </View>
  );
}

function makeStyles(colors: typeof Colors) {
  return StyleSheet.create({
    wrapper: {
      backgroundColor: colors.surface,
    },
    container: {
      paddingHorizontal: 12,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical:   12,
      alignItems:        'center',
      position:          'relative',
    },
    tabActive: {},
    label: {
      fontSize:   14,
      fontWeight: '600',
      color:      colors.textMuted,
    },
    indicator: {
      position:     'absolute',
      bottom:       0,
      left:         16,
      right:        16,
      height:       2,
      borderRadius: 1,
    },
    border: {
      height: 1,
    },
  });
}
