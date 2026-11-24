import React from 'react';
import { Pressable as RNPressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
}

/** Pressable with a consistent pressed state + hit slop for small targets. */
export function Touchable({ style, pressedStyle, ...rest }: Props) {
  return (
    <RNPressable
      hitSlop={6}
      {...rest}
      style={({ pressed }) => [style, pressed && (pressedStyle ?? { opacity: 0.7 })]}
    />
  );
}
