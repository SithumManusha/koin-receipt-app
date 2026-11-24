import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';
import { Touchable } from '../components/Pressable';
import { colors } from '../theme';

const STEPS = ['Reading merchant & date…', 'Finding line items…', 'Adding up totals…'];

export function ScanningScreen({ imageUri, onCancel }: { imageUri?: string; onCancel: () => void }) {
  const insets = useSafeAreaInsets();
  const sweep = useRef(new Animated.Value(0)).current;
  const [h, setH] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(sweep, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 750);
    return () => { loop.stop(); clearInterval(t); };
  }, [sweep]);

  const onLayout = (e: LayoutChangeEvent) => setH(e.nativeEvent.layout.height);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.top}>
        <AppText weight="bold" size={22}>Scanning receipt</AppText>
        <Touchable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel scan" style={styles.cancel}>
          <AppText weight="semibold" size={15} color={colors.muted}>Cancel</AppText>
        </Touchable>
      </View>

      <View style={styles.preview} onLayout={onLayout}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel="Receipt preview" />
        ) : (
          <SamplePaper />
        )}
        <View style={styles.tint} />
        <Animated.View
          style={[styles.beam, { transform: [{ translateY: sweep.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(h - 4, 0)] }) }] }]}
        />
      </View>

      <View style={styles.status} accessibilityLiveRegion="polite">
        <View style={styles.spinnerBadge}><Icon name="text-recognition" size={20} color={colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <AppText weight="semibold" size={16}>Extracting your items</AppText>
          <AppText size={13} color={colors.muted} style={{ marginTop: 2 }}>{STEPS[step]}</AppText>
        </View>
      </View>
    </View>
  );
}

/** Drawn stand-in for a receipt when using a sample (no photo). */
function SamplePaper() {
  const lines = [0.5, 0.8, 0.65, 0.8, 0.4, 0.7, 0.8, 0.55];
  return (
    <View style={styles.paper}>
      <Icon name="receipt-text-outline" size={34} color="#8A948F" />
      {lines.map((w, i) => (
        <View key={i} style={{ height: 8, width: `${w * 100}%`, borderRadius: 4, backgroundColor: '#DDE2DF', marginTop: 14 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 18 },
  cancel: { paddingVertical: 8, paddingLeft: 12 },
  preview: { flex: 1, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
  tint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(16,185,129,0.08)' },
  beam: {
    position: 'absolute', left: 0, right: 0, height: 4, backgroundColor: colors.primary,
    shadowColor: colors.primary, shadowOpacity: 0.9, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
    boxShadow: '0 0 18px 6px rgba(16,185,129,0.55)',
  } as any,
  status: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18, padding: 16,
    backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border,
  },
  spinnerBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#D9F2E6', alignItems: 'center', justifyContent: 'center' },
  paper: { flex: 1, padding: 28, backgroundColor: '#FBFAF7' },
});
