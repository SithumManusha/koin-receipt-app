import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { ExpenseRow } from '../components/ExpenseRow';
import { Icon } from '../components/Icon';
import { Touchable } from '../components/Pressable';
import { ScanSource, ScanSourceSheet } from '../components/ScanSourceSheet';
import { TabBar } from '../components/TabBar';
import { UploadCard } from '../components/UploadCard';
import type { Expense } from '../domain/types';
import { colors } from '../theme';

interface Props {
  expenses: Expense[];
  highlightId: string | null;
  onScan: (source: ScanSource) => void;
  onTab: (key: string) => void;
}

export function ExpensesScreen({ expenses, highlightId, onScan, onTab }: Props) {
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState(false);
  const listRef = useRef<FlatList<Expense>>(null);

  // Bring a freshly saved expense into view (e.g. when its date sorts it lower down).
  useEffect(() => {
    if (!highlightId) return;
    const index = expenses.findIndex((e) => e.id === highlightId);
    if (index < 0) return;
    const t = setTimeout(() => listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.35 }), 350);
    return () => clearTimeout(t);
  }, [highlightId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <FlatList
        ref={listRef}
        onScrollToIndexFailed={() => listRef.current?.scrollToEnd({ animated: true })}
        data={expenses}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <ExpenseRow expense={item} highlight={item.id === highlightId} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <AppText weight="bold" size={11} color={colors.primary} style={styles.eyebrow}>KOIN</AppText>
                <AppText weight="bold" size={30} style={{ marginTop: 2 }} accessibilityRole="header">Expenses</AppText>
              </View>
              <Touchable
                onPress={() => setSheet(true)}
                style={styles.scan}
                pressedStyle={{ backgroundColor: colors.primaryPress }}
                accessibilityRole="button"
                accessibilityLabel="Scan bill"
              >
                <Icon name="plus" size={20} color={colors.text} />
                <AppText weight="semibold" size={15} color={colors.text}>Scan Bill</AppText>
              </Touchable>
            </View>

            <UploadCard onCamera={() => onScan('camera')} onGallery={() => onScan('gallery')} />

            <View style={styles.sectionHeader}>
              <AppText weight="bold" size={20}>Recent Activity</AppText>
              <AppText size={13} color={colors.muted}>This week</AppText>
            </View>
          </View>
        }
      />
      <TabBar active="expenses" onPress={onTab} />
      <ScanSourceSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        onPick={(s) => {
          setSheet(false);
          // let the sheet finish closing before a system picker takes over
          setTimeout(() => onScan(s), 230);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 14 },
  eyebrow: { letterSpacing: 2 },
  scan: {
    flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingLeft: 14, paddingRight: 18,
    borderRadius: 22, backgroundColor: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, marginTop: 28, marginBottom: 6,
  },
});
