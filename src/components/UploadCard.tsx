import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Touchable } from './Pressable';

interface Props {
  onCamera: () => void;
  onGallery: () => void;
  disabled?: boolean;
}

export function UploadCard({ onCamera, onGallery, disabled }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBadge}>
        <Icon name="receipt-text-outline" size={22} color={colors.primary} />
      </View>
      <AppText weight="bold" size={20} style={{ marginTop: 14 }}>Upload or Snap a Bill</AppText>
      <AppText size={14} color={colors.muted} style={{ marginTop: 6 }}>Less typing. More living.</AppText>
      <View style={styles.actions}>
        <ActionButton icon="camera-outline" label="Camera" onPress={onCamera} disabled={disabled} />
        <ActionButton icon="image-outline" label="Gallery" onPress={onGallery} disabled={disabled} />
      </View>
    </View>
  );
}

function ActionButton({ icon, label, onPress, disabled }: { icon: string; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.action}
    >
      <Icon name={icon} size={18} color={colors.text} />
      <AppText weight="medium" size={14}>{label}</AppText>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24, marginTop: 20, paddingVertical: 28, paddingHorizontal: 16,
    backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1.5, borderStyle: 'dashed',
    borderColor: '#8BD3B5', alignItems: 'center',
  },
  iconBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#D9F2E6', alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  action: {
    flexDirection: 'row', alignItems: 'center', gap: 8, height: 42, paddingHorizontal: 18,
    borderRadius: radius.md, backgroundColor: colors.chip, borderWidth: 1, borderColor: colors.border,
  },
});
