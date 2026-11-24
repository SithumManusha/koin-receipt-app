import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CATEGORIES } from '../domain/categories';
import type { CategoryId } from '../domain/types';
import { colors } from '../theme';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { CategoryBadge } from './CategoryBadge';
import { Icon } from './Icon';
import { Touchable } from './Pressable';

interface Props {
  visible: boolean;
  selected: CategoryId;
  onClose: () => void;
  onSelect: (id: CategoryId) => void;
}

export function CategorySheet({ visible, selected, onClose, onSelect }: Props) {
  return (
    <BottomSheet visible={visible} title="Category" onClose={onClose}>
      {CATEGORIES.map((c) => {
        const on = c.id === selected;
        return (
          <Touchable
            key={c.id}
            style={styles.row}
            onPress={() => onSelect(c.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={c.label}
          >
            <CategoryBadge category={c.id} size={36} />
            <AppText weight={on ? 'semibold' : 'medium'} size={16} style={{ flex: 1 }}>{c.label}</AppText>
            {on ? <Icon name="check" size={20} color={colors.primary} /> : <View style={{ width: 20 }} />}
          </Touchable>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
});
