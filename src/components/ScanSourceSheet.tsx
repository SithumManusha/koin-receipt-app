import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';
import { Touchable } from './Pressable';

export type ScanSource = 'camera' | 'gallery' | 'sample';

const OPTIONS: Array<{ key: ScanSource; icon: string; label: string; hint: string }> = [
  { key: 'camera', icon: 'camera-outline', label: 'Take a photo', hint: 'Snap a paper receipt' },
  { key: 'gallery', icon: 'image-outline', label: 'Choose from gallery', hint: 'Pick a saved receipt photo' },
  { key: 'sample', icon: 'flask-outline', label: 'Use a sample receipt', hint: 'Try the flow instantly, no photo needed' },
];

export function ScanSourceSheet({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (s: ScanSource) => void }) {
  return (
    <BottomSheet visible={visible} title="Scan a bill" onClose={onClose}>
      {OPTIONS.map((o) => (
        <Touchable key={o.key} style={styles.row} onPress={() => onPick(o.key)} accessibilityRole="button" accessibilityLabel={o.label}>
          <View style={styles.icon}><Icon name={o.icon} size={22} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <AppText weight="semibold" size={16}>{o.label}</AppText>
            <AppText size={13} color={colors.muted} style={{ marginTop: 2 }}>{o.hint}</AppText>
          </View>
          <Icon name="chevron-right" size={22} color={colors.mutedLight} />
        </Touchable>
      ))}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  icon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#D9F2E6', alignItems: 'center', justifyContent: 'center' },
});
