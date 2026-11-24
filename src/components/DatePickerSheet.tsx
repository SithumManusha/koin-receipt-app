import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { daysInMonth, makeISO, MONTHS_LONG, parseISODate, todayISO, weekdayOfFirst } from '../domain/date';
import { colors } from '../theme';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';
import { Touchable } from './Pressable';

interface Props {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSelect: (iso: string) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Dependency-free calendar so it behaves identically on iOS, Android and web. Future dates are disabled. */
export function DatePickerSheet({ visible, value, onClose, onSelect }: Props) {
  const today = todayISO();
  const initial = parseISODate(value) ?? parseISODate(today)!;
  const [view, setView] = useState({ y: initial.y, m: initial.m });

  useEffect(() => {
    if (visible) {
      const p = parseISODate(value) ?? parseISODate(today)!;
      setView({ y: p.y, m: p.m });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const cells = useMemo(() => {
    const lead = weekdayOfFirst(view.y, view.m);
    const total = daysInMonth(view.y, view.m);
    const out: Array<number | null> = Array(lead).fill(null);
    for (let d = 1; d <= total; d++) out.push(d);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [view]);

  const t = parseISODate(today)!;
  const canGoNext = view.y < t.y || (view.y === t.y && view.m < t.m);
  const shift = (delta: number) =>
    setView(({ y, m }) => {
      const idx = y * 12 + (m - 1) + delta;
      return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
    });

  return (
    <BottomSheet visible={visible} title="Receipt date" onClose={onClose}>
      <View style={styles.nav}>
        <Touchable onPress={() => shift(-1)} accessibilityLabel="Previous month" style={styles.navBtn}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Touchable>
        <AppText weight="semibold" size={16}>{MONTHS_LONG[view.m - 1]} {view.y}</AppText>
        <Touchable onPress={() => canGoNext && shift(1)} disabled={!canGoNext} accessibilityLabel="Next month" style={[styles.navBtn, !canGoNext && { opacity: 0.3 }]}>
          <Icon name="chevron-right" size={24} color={colors.text} />
        </Touchable>
      </View>
      <View style={styles.grid}>
        {WEEKDAYS.map((w, i) => (
          <View key={`w${i}`} style={styles.cell}><AppText size={12} weight="medium" color={colors.muted}>{w}</AppText></View>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <View key={`e${i}`} style={styles.cell} />;
          const iso = makeISO(view.y, view.m, d);
          const selected = iso === value;
          const future = iso > today;
          return (
            <View key={iso} style={styles.cell}>
              <Touchable
                disabled={future}
                onPress={() => onSelect(iso)}
                accessibilityRole="button"
                accessibilityLabel={iso}
                accessibilityState={{ selected, disabled: future }}
                style={[styles.day, selected && styles.daySelected, iso === today && !selected && styles.dayToday]}
              >
                <AppText
                  weight={selected ? 'bold' : 'medium'} size={15} tabular
                  color={selected ? '#fff' : future ? colors.mutedLight : colors.text}
                  style={future ? { opacity: 0.5 } : undefined}
                >
                  {d}
                </AppText>
              </Touchable>
            </View>
          );
        })}
      </View>
      <Touchable onPress={() => onSelect(today)} style={styles.todayBtn} accessibilityRole="button">
        <AppText weight="semibold" size={15} color={colors.primary}>Today</AppText>
      </Touchable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', justifyContent: 'center', height: 44 },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: colors.primary },
  dayToday: { borderWidth: 1.5, borderColor: colors.primary },
  todayBtn: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 20, marginTop: 4 },
});
