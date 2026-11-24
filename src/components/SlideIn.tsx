import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet } from 'react-native';
import { colors } from '../theme';

export interface SlideHandle {
  dismiss: (after?: () => void) => void;
}

/** Full-screen layer that slides in from the right on mount and out on dismiss(). */
export const SlideIn = forwardRef<SlideHandle, { children: React.ReactNode }>(function SlideIn({ children }, ref) {
  const progress = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);
  const started = useRef(false);

  useImperativeHandle(ref, () => ({
    dismiss: (after) => {
      Animated.timing(progress, { toValue: 0, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => after?.());
    },
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
    if (!started.current) {
      started.current = true;
      Animated.timing(progress, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
  };

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.layer,
        { opacity: width ? 1 : 0, transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [width, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill, backgroundColor: colors.bg },
});
