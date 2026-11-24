import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Keyboard, LayoutAnimation, Platform, ScrollView, StyleSheet, TextInput, UIManager, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { CategorySheet } from '../components/CategorySheet';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { Icon } from '../components/Icon';
import { ItemRow } from '../components/ItemRow';
import { Touchable } from '../components/Pressable';
import { ReceiptThumb } from '../components/ReceiptThumb';
import { TotalBar } from '../components/TotalBar';
import { getCategory } from '../domain/categories';
import { formatDateLong, timeNowHHmm, todayISO } from '../domain/date';
import { draftPricedCount, draftReducer, draftTotalCents, uid } from '../domain/draft';
import type { Draft, Expense } from '../domain/types';
import { validateDraft, ValidationResult } from '../domain/validation';
import { haptic } from '../haptics';
import { colors, fonts, noOutline, radius } from '../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  initial: Draft;
  imageUri?: string;
  onBack: () => void;
  onSave: (expense: Expense) => void;
}

const animateLayout = () => LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));

export function ReviewScreen({ initial, imageUri, onBack, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [draft, dispatch] = useReducer(draftReducer, initial);
  const [attempted, setAttempted] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [keyboardUp, setKeyboardUp] = useState(false);
  const saving = useRef(false);

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const merchantRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const itemsTop = useRef(0);
  const rowY = useRef<Record<string, number>>({});

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardUp(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardUp(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const totalCents = draftTotalCents(draft);
  // After the first failed save, errors update live as the user fixes things.
  const result: ValidationResult | null = attempted ? validateDraft(draft) : null;
  const errors = result?.errors;
  const cat = getCategory(draft.category);

  const addItem = useCallback(() => {
    const id = uid('item');
    animateLayout();
    dispatch({ type: 'addItem', id });
    setLastAddedId(id);
    haptic.light();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  }, []);

  const removeItem = useCallback((id: string) => {
    animateLayout();
    dispatch({ type: 'removeItem', id });
    haptic.light();
  }, []);

  const confirm = () => {
    if (saving.current) return;
    Keyboard.dismiss();
    const check = validateDraft(draft);
    if (!check.valid) {
      setAttempted(true);
      setShakeKey((k) => k + 1);
      haptic.error();
      // bring the first problem into view
      const firstBadItem = draft.items.find((i) => check.errors.byItem[i.id]);
      if (check.errors.merchant || check.errors.date) scrollRef.current?.scrollTo({ y: 0, animated: true });
      else if (firstBadItem) scrollRef.current?.scrollTo({ y: Math.max(itemsTop.current + (rowY.current[firstBadItem.id] ?? 0) - 24, 0), animated: true });
      if (check.errors.merchant) setTimeout(() => merchantRef.current?.focus(), 250);
      return;
    }
    saving.current = true;
    const today = todayISO();
    onSave({
      id: uid('exp'),
      merchant: draft.merchant.trim(),
      category: draft.category,
      date: draft.date,
      time: draft.date === today ? timeNowHHmm() : undefined,
      totalCents,
      items: draft.items.map((i) => ({ name: i.name.trim(), priceCents: draftTotalCents({ ...draft, items: [i] }) })),
      createdAt: Date.now(),
    });
  };

  const bottomInset = keyboardUp ? 12 : Math.max(insets.bottom, 16);

  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior="padding">
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Touchable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
            <Icon name="arrow-left" size={26} color={colors.text} />
          </Touchable>
          <AppText weight="bold" size={22} accessibilityRole="header">Review Receipt</AppText>
        </View>
        <ReceiptThumb
          uri={imageUri}
          size={48}
          merchant={draft.merchant}
          dateLabel={formatDateLong(draft.date)}
          items={draft.items}
          totalCents={totalCents}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        <View style={styles.card}>
          <AppText size={12} color={errors?.merchant ? colors.danger : colors.muted}>Merchant Name</AppText>
          <View style={styles.merchantRow}>
            <TextInput
              ref={merchantRef}
              value={draft.merchant}
              onChangeText={(v) => dispatch({ type: 'setMerchant', value: v })}
              placeholder="e.g. Cafe Kumbuk"
              placeholderTextColor={colors.mutedLight}
              style={styles.merchantInput}
              maxLength={60}
              autoCapitalize="words"
              returnKeyType="done"
              accessibilityLabel="Merchant name"
            />
            <Touchable onPress={() => merchantRef.current?.focus()} accessibilityLabel="Edit merchant name" accessibilityRole="button">
              <Icon name="pencil-outline" size={20} color="#5B6472" />
            </Touchable>
          </View>
          {errors?.merchant ? <AppText size={12} color={errors.merchant ? colors.danger : colors.muted} style={{ marginBottom: 6 }}>{errors.merchant}</AppText> : null}
          <View style={styles.divider} />
          <View style={styles.fieldsRow}>
            <View style={{ flex: 1 }}>
              <AppText size={12} color={errors?.date ? colors.danger : colors.muted}>Date</AppText>
              <Touchable onPress={() => { Keyboard.dismiss(); setDateOpen(true); }} style={styles.dateBtn} accessibilityRole="button" accessibilityLabel={`Date ${formatDateLong(draft.date)}`}>
                <AppText weight="medium" size={15} tabular>{formatDateLong(draft.date)}</AppText>
                <Icon name="calendar-blank-outline" size={17} color="#5B6472" />
              </Touchable>
              {errors?.date ? <AppText size={12} color={colors.danger}>{errors.date}</AppText> : null}
            </View>
            <View style={{ alignItems: 'flex-start' }}>
              <AppText size={12} color={colors.muted}>Category</AppText>
              <Touchable onPress={() => { Keyboard.dismiss(); setCategoryOpen(true); }} style={styles.pill} accessibilityRole="button" accessibilityLabel={`Category ${cat.label}`}>
                <AppText weight="medium" size={12} color={colors.primaryDark}>{cat.label}</AppText>
                <Icon name="chevron-down" size={15} color={colors.primaryDark} />
              </Touchable>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.sectionHeader}>
          <AppText weight="bold" size={20}>Extracted Items</AppText>
          <AppText size={13} color={colors.muted} tabular>{draft.items.length} {draft.items.length === 1 ? 'item' : 'items'}</AppText>
        </View>

        <View onLayout={(e) => { itemsTop.current = e.nativeEvent.layout.y; }}>
          {draft.items.length === 0 ? (
            <View style={[styles.empty, errors?.items && { borderColor: colors.danger }]}>
              <Icon name="receipt-text-plus-outline" size={26} color={errors?.items ? colors.danger : colors.mutedLight} />
              <AppText size={14} color={errors?.items ? colors.danger : colors.muted} weight="medium">
                {errors?.items ?? 'No items yet. Add what you bought.'}
              </AppText>
            </View>
          ) : (
            draft.items.map((item, idx) => (
              <View key={item.id} onLayout={(e) => { rowY.current[item.id] = e.nativeEvent.layout.y; }}>
                <ItemRow
                  item={item}
                  isLast={idx === draft.items.length - 1}
                  errors={errors?.byItem[item.id]}
                  autoFocus={item.id === lastAddedId}
                  onName={(v) => dispatch({ type: 'setItemName', id: item.id, value: v })}
                  onPrice={(v) => dispatch({ type: 'setItemPrice', id: item.id, value: v })}
                  onPriceBlur={() => dispatch({ type: 'blurItemPrice', id: item.id })}
                  onRemove={() => removeItem(item.id)}
                />
              </View>
            ))
          )}
        </View>

        <Touchable onPress={addItem} style={styles.addBtn} accessibilityRole="button" accessibilityLabel="Add item">
          <Icon name="plus" size={20} color={colors.primary} />
          <AppText weight="semibold" size={15} color={colors.primary}>Add Item</AppText>
        </Touchable>

        <View style={styles.note}>
          <Icon name="check" size={15} color={colors.muted} />
          <AppText size={12} color={colors.muted}>All set? Give your items a quick check.</AppText>
        </View>
      </ScrollView>

      <TotalBar
        totalCents={totalCents}
        itemCount={draftPricedCount(draft)}
        bottomInset={bottomInset}
        error={result && !result.valid ? result.messages[0] : null}
        shakeKey={shakeKey}
        onConfirm={confirm}
      />

      <CategorySheet
        visible={categoryOpen}
        selected={draft.category}
        onClose={() => setCategoryOpen(false)}
        onSelect={(id) => { dispatch({ type: 'setCategory', value: id }); setCategoryOpen(false); }}
      />
      <DatePickerSheet
        visible={dateOpen}
        value={draft.date}
        onClose={() => setDateOpen(false)}
        onSelect={(iso) => { dispatch({ type: 'setDate', value: iso }); setDateOpen(false); }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginLeft: -4 },
  card: {
    backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16,
  },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  merchantInput: { ...noOutline, flex: 1, fontFamily: fonts.medium, fontSize: 18, color: colors.text, paddingVertical: 6, minWidth: 0 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong, marginVertical: 12 },
  fieldsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, alignSelf: 'flex-start', minHeight: 28 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, paddingVertical: 6, paddingLeft: 12, paddingRight: 8,
    borderRadius: radius.pill, backgroundColor: colors.primaryTint,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 6 },
  empty: {
    alignItems: 'center', gap: 8, paddingVertical: 24, borderRadius: radius.lg, borderWidth: 1.5,
    borderStyle: 'dashed', borderColor: colors.borderStrong, marginTop: 8,
  },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 14 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
});
