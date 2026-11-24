import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Name = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Icon({ name, size = 20, color }: { name: string; size?: number; color: string }) {
  return <MaterialCommunityIcons name={name as Name} size={size} color={color} />;
}
