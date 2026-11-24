import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { colors, fonts, FontWeightKey } from '../theme';

interface Props extends TextProps {
  weight?: FontWeightKey;
  size?: number;
  color?: string;
  /** Fixed-width digits so amounts line up in a column. */
  tabular?: boolean;
}

export function AppText({ weight = 'regular', size = 14, color = colors.text, tabular, style, ...rest }: Props) {
  const base: TextStyle = { fontFamily: fonts[weight], fontSize: size, color, ...(tabular ? { fontVariant: ['tabular-nums'] as const } : null) };
  return <Text {...rest} style={[base, style]} />;
}
