import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { formatCents, parseCents } from '../domain/money';
import type { DraftItem } from '../domain/types';
import { colors, radius } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Touchable } from './Pressable';

interface Props {
  uri?: string;
  size?: number;
  merchant?: string;
  dateLabel?: string;
  items?: DraftItem[];
  totalCents?: number;
}

export function ReceiptThumb({ uri, size = 48, merchant, dateLabel, items, totalCents }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Touchable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="View scanned receipt"
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: '#34443F',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
        ) : (
          <Icon name="receipt-text-outline" size={size * 0.56} color="#F4F1EA" />
        )}
      </Touchable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <AppText weight="bold" size={16}>Scanned Receipt</AppText>
              <Touchable
                onPress={() => setOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close receipt preview"
                style={styles.closeBtn}
              >
                <Icon name="close" size={20} color={colors.text} />
              </Touchable>
            </View>

            {uri ? (
              <Image source={{ uri }} style={styles.fullImage} resizeMode="contain" />
            ) : (
              <View style={styles.paper}>
                <AppText weight="bold" size={15} style={styles.center}>
                  {(merchant?.trim() || 'RECEIPT').toUpperCase()}
                </AppText>
                {dateLabel ? (
                  <AppText size={12} color={colors.muted} style={styles.center}>
                    {dateLabel}
                  </AppText>
                ) : null}
                <View style={styles.dashed} />
                {(items ?? []).map((item) => {
                  const c = parseCents(item.priceText) ?? 0;
                  return (
                    <View key={item.id} style={styles.line}>
                      <AppText size={13} style={{ flex: 1, marginRight: 12 }} numberOfLines={1}>
                        {item.name.trim() || 'Untitled item'}
                      </AppText>
                      <AppText size={13} weight="medium" tabular>
                        {formatCents(c)}
                      </AppText>
                    </View>
                  );
                })}
                <View style={styles.dashed} />
                <View style={styles.line}>
                  <AppText weight="bold" size={14}>TOTAL</AppText>
                  <AppText weight="bold" size={14} tabular>
                    {formatCents(totalCents ?? 0)}
                  </AppText>
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: 360,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  paper: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 16,
    gap: 6,
  },
  center: {
    textAlign: 'center',
  },
  dashed: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    marginVertical: 6,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
