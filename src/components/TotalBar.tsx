import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { formatCents } from '../domain/money';
import { colors } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Touchable } from './Pressable';

interface Props {
  totalCents: number;
  itemCount: number;
  bottomInset: number;
  error?: string | null;
  shakeKey: number;
  onConfirm: () => void;
}

/** Sticky summary bar: live total, item count and the primary action. */
export function TotalBar({ totalCents, itemCount, bottomInset, error, shakeKey, onConfirm }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.05, duration: 90, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
  }, [totalCents, pulse]);

  useEffect(() => {
    if (shakeKey === 0) return;
    shake.setValue(0);
    Animated.sequence([-8, 8, -6, 6, -3, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 55, useNativeDriver: true }))).start();
  }, [shakeKey, shake]);

  return (
    <View style={[styles.bar, { paddingBottom: bottomInset }]}>
      <View style={styles.topRow}>
        <View>
          <AppText size={13} color={colors.muted}>Total Amount</AppText>
          <Animated.View style={{ transform: [{ scale: pulse }], transformOrigin: 'left center' } as any}>
            <AppText weight="extrabold" size={34} tabular style={{ marginTop: 2 }} accessibilityLabel={`Total ${formatCents(totalCents)}`}>
              {formatCents(totalCents)}
            </AppText>
          </Animated.View>
        </View>
        <View style={styles.count}>
          <Icon name="check" size={15} color={colors.primary} />
          <AppText weight="medium" size={13} color={colors.primaryDark} tabular>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </AppText>
        </View>
      </View>
      {error ? (
        <View style={styles.error} accessibilityLiveRegion="polite">
          <Icon name="alert-circle-outline" size={16} color={colors.danger} />
          <AppText size={13} weight="medium" color={colors.danger} style={{ flex: 1 }}>{error}</AppText>
        </View>
      ) : null}
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        <Touchable
          onPress={onConfirm}
          accessibilityRole="button"
          accessibilityLabel="Confirm and save expense"
          style={styles.confirm}
          pressedStyle={{ backgroundColor: colors.primaryPress, transform: [{ scale: 0.985 }] }}
        >
          <Icon name="check" size={20} color={colors.text} />
          <AppText weight="semibold" size={16} color={colors.text}>Confirm & Save Expense</AppText>
        </Touchable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.card, paddingHorizontal: 24, paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderStrong,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  count: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 8 },
  error: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.dangerTint,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, marginBottom: 10,
  },
  confirm: {
    height: 54, borderRadius: 16, backgroundColor: colors.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
});
