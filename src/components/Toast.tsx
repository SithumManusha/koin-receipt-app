import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

export interface ToastData {
  id: number;
  message: string;
  tone?: 'success' | 'info';
}

/** Bottom toast that slides up, holds, then fades. Re-triggers when `toast.id` changes. */
export function Toast({ toast, bottom }: { toast: ToastData | null; bottom: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(anim, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [toast?.id, anim]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!toast) return null;
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.wrap,
        { bottom, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
      ]}
    >
      <View style={styles.toast}>
        <Icon name={toast.tone === 'info' ? 'information-outline' : 'check-circle'} size={18} color={colors.primary} />
        <AppText weight="medium" size={14} color="#fff" style={{ flexShrink: 1 }}>{toast.message}</AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.text,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14,
  },
});
