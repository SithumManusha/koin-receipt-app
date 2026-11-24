import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { activityLabel } from '../domain/date';
import { formatCents } from '../domain/money';
import type { Expense } from '../domain/types';
import { colors } from '../theme';
import { AppText } from './AppText';
import { CategoryBadge } from './CategoryBadge';

export function ExpenseRow({ expense, highlight }: { expense: Expense; highlight?: boolean }) {
  const flash = useRef(new Animated.Value(highlight ? 1 : 0)).current;
  const appear = useRef(new Animated.Value(highlight ? 0 : 1)).current;

  useEffect(() => {
    if (!highlight) return;
    Animated.parallel([
      Animated.timing(appear, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 2400, delay: 400, useNativeDriver: true }),
    ]).start();
  }, [highlight, appear, flash]);

  return (
    <Animated.View
      style={[
        styles.row,
        { opacity: appear, transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] },
      ]}
    >
      {highlight ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.flashOverlay, { opacity: flash }]}
        />
      ) : null}
      <CategoryBadge category={expense.category} />
      <View style={styles.mid}>
        <AppText weight="medium" size={16} numberOfLines={1}>{expense.merchant}</AppText>
        <AppText size={13} color={colors.muted} style={{ marginTop: 2 }}>
          {activityLabel(expense.date, expense.time)}
        </AppText>
      </View>
      <AppText weight="bold" size={16} tabular>{formatCents(expense.totalCents)}</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, marginHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderStrong,
    overflow: 'hidden',
  },
  flashOverlay: {
    backgroundColor: 'rgba(16,185,129,0.14)',
    borderRadius: 10,
  },
  mid: { flex: 1, marginLeft: 12, marginRight: 12 },
});
