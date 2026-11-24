import React, { useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { ItemErrors } from '../domain/validation';
import type { DraftItem } from '../domain/types';
import { colors, fonts, noOutline, radius } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Touchable } from './Pressable';

interface Props {
  item: DraftItem;
  errors?: ItemErrors;
  autoFocus?: boolean;
  isLast: boolean;
  onName: (v: string) => void;
  onPrice: (v: string) => void;
  onPriceBlur: () => void;
  onRemove: () => void;
}

export function ItemRow({ item, errors, autoFocus, isLast, onName, onPrice, onPriceBlur, onRemove }: Props) {
  const nameRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => nameRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  return (
    <View style={[styles.wrap, !isLast && styles.divider]}>
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <TextInput
            ref={nameRef}
            value={item.name}
            onChangeText={onName}
            placeholder="Item name"
            placeholderTextColor={errors?.name ? colors.danger : colors.mutedLight}
            style={styles.name}
            returnKeyType="next"
            autoCapitalize="sentences"
            maxLength={80}
            accessibilityLabel="Item name"
          />
        </View>
        <View style={[styles.priceBox, errors?.price && styles.priceBoxError]}>
          <AppText size={13} color={colors.muted}>$</AppText>
          <TextInput
            value={item.priceText}
            onChangeText={onPrice}
            onBlur={onPriceBlur}
            placeholder="0.00"
            placeholderTextColor={colors.mutedLight}
            keyboardType="decimal-pad"
            style={styles.price}
            selectTextOnFocus
            maxLength={10}
            accessibilityLabel={`Price for ${item.name || 'item'}`}
          />
        </View>
        <Touchable onPress={onRemove} style={styles.trash} accessibilityRole="button" accessibilityLabel={`Delete ${item.name || 'item'}`}>
          <Icon name="trash-can-outline" size={21} color="#5B6472" />
        </Touchable>
      </View>
      {(errors?.name || errors?.price) && (
        <AppText size={12} color={colors.danger} style={{ marginTop: 2, marginBottom: 6 }}>
          {errors.name && errors.price ? 'Add a name and a price' : errors.name ?? errors.price}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 8 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderStrong },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { ...noOutline, fontFamily: fonts.medium, fontSize: 15, color: colors.text, paddingVertical: 10, minHeight: 44 },
  priceBox: {
    flexDirection: 'row', alignItems: 'center', width: 88, height: 42, paddingHorizontal: 12,
    backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
  },
  priceBoxError: { borderColor: colors.danger, backgroundColor: colors.dangerTint },
  price: {
    ...noOutline, flex: 1, textAlign: 'right', fontFamily: fonts.semibold, fontSize: 15, color: colors.text,
    fontVariant: ['tabular-nums'], paddingVertical: 0, height: 40, minWidth: 0,
  },
  trash: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
});
