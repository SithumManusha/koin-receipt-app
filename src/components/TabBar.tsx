import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Touchable } from './Pressable';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'expenses', label: 'Expenses', icon: 'receipt-text-outline' },
  { key: 'insights', label: 'Insights', icon: 'chart-bar' },
  { key: 'profile', label: 'Profile', icon: 'account-outline' },
] as const;

export function TabBar({ active, onPress }: { active: string; onPress: (key: string) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map((t) => {
        const on = t.key === active;
        const color = on ? colors.primary : colors.muted;
        return (
          <Touchable
            key={t.key}
            style={styles.tab}
            onPress={() => onPress(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
          >
            <Icon name={t.icon} size={24} color={color} />
            <AppText weight={on ? 'semibold' : 'medium'} size={11} color={color} style={{ marginTop: 4 }}>{t.label}</AppText>
          </Touchable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', backgroundColor: colors.card, paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderStrong,
  },
  tab: { flex: 1, alignItems: 'center' },
});
