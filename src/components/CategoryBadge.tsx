import React from 'react';
import { View } from 'react-native';
import { getCategory } from '../domain/categories';
import type { CategoryId } from '../domain/types';
import { Icon } from './Icon';

export function CategoryBadge({ category, size = 44 }: { category: CategoryId; size?: number }) {
  const c = getCategory(category);
  return (
    <View
      style={{
        width: size, height: size, borderRadius: 14, backgroundColor: c.tint,
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon name={c.icon} size={size * 0.5} color={c.fg} />
    </View>
  );
}
