import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, useFonts } from '@expo-google-fonts/inter';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScanSource } from './src/components/ScanSourceSheet';
import { SlideHandle, SlideIn } from './src/components/SlideIn';
import { Toast, ToastData } from './src/components/Toast';
import { draftFromExtraction } from './src/domain/draft';
import { formatCents } from './src/domain/money';
import type { Draft, Expense } from './src/domain/types';
import { ReceiptImage, extractReceipt } from './src/services/extraction';
import { ExpensesScreen } from './src/screens/ExpensesScreen';
import { ReviewScreen } from './src/screens/ReviewScreen';
import { ScanningScreen } from './src/screens/ScanningScreen';
import { ExpensesProvider, useExpenses } from './src/state/expenses';
import { haptic } from './src/haptics';
import { colors } from './src/theme';

type Flow =
  | { step: 'list' }
  | { step: 'scanning'; imageUri?: string }
  | { step: 'review'; imageUri?: string; draft: Draft; runId: number };

type PickResult = { image: ReceiptImage } | { cancelled: true } | { error: string };

async function pickReceiptImage(kind: 'camera' | 'gallery'): Promise<PickResult> {
  try {
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6, base64: true };
    let res: ImagePicker.ImagePickerResult;
    if (kind === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return { error: 'Camera access is off. Enable it in Settings, or choose a photo from your gallery.' };
      res = await ImagePicker.launchCameraAsync(options);
    } else {
      res = await ImagePicker.launchImageLibraryAsync(options);
    }
    if (res.canceled || !res.assets?.length) return { cancelled: true };
    const a = res.assets[0];
    return { image: { uri: a.uri, base64: a.base64, mimeType: a.mimeType } };
  } catch {
    return { error: kind === 'camera' ? 'The camera isn’t available here. Try Gallery or a sample receipt.' : 'Couldn’t open your gallery. Try a sample receipt instead.' };
  }
}

function Root() {
  const { expenses, addExpense } = useExpenses();
  const [flow, setFlow] = useState<Flow>({ step: 'list' });
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const slide = useRef<SlideHandle>(null);
  const runId = useRef(0);
  const abort = useRef<AbortController | null>(null);

  const showToast = useCallback((message: string, tone: ToastData['tone'] = 'success') => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  const close = useCallback((after?: () => void) => {
    runId.current += 1; // invalidate any in-flight extraction
    abort.current?.abort();
    slide.current?.dismiss(() => {
      setFlow({ step: 'list' });
      after?.();
    });
  }, []);

  const startScan = useCallback(async (source: ScanSource) => {
    let image: ReceiptImage | null = null;
    if (source !== 'sample') {
      const picked = await pickReceiptImage(source);
      if ('cancelled' in picked) return;
      if ('error' in picked) { Alert.alert('Can’t scan yet', picked.error); return; }
      image = picked.image;
    }

    const id = ++runId.current;
    const controller = new AbortController();
    abort.current = controller;
    setFlow({ step: 'scanning', imageUri: image?.uri });

    try {
      const result = await extractReceipt(image, controller.signal);
      if (id !== runId.current) return; // cancelled
      setFlow({ step: 'review', imageUri: image?.uri, draft: draftFromExtraction(result.receipt), runId: id });
      if (result.fallbackReason) showToast('Couldn’t read that live, so we loaded a sample receipt. Edit as needed.', 'info');
      else if (result.source === 'simulated') showToast(image ? 'Demo mode: showing a sample extraction. Add an API key for live scanning.' : 'Sample receipt loaded. Edit anything below.', 'info');
    } catch {
      if (id !== runId.current) return;
      close(() => Alert.alert('Scan failed', 'We couldn’t read that receipt. Please try again.'));
    }
  }, [close, showToast]);

  const save = useCallback((expense: Expense) => {
    addExpense(expense);
    haptic.success();
    slide.current?.dismiss(() => {
      setFlow({ step: 'list' });
      setHighlightId(expense.id);
      showToast(`Saved ${expense.merchant} · ${formatCents(expense.totalCents)}`);
    });
  }, [addExpense, showToast]);

  // Android hardware back
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (flow.step === 'list') return false;
      close();
      return true;
    });
    return () => sub.remove();
  }, [flow.step, close]);

  return (
    <View style={styles.fill}>
      <ExpensesScreen
        expenses={expenses}
        highlightId={highlightId}
        onScan={startScan}
        onTab={(key) => key !== 'expenses' && showToast('Coming soon', 'info')}
      />
      {flow.step !== 'list' && (
        <SlideIn ref={slide}>
          {flow.step === 'scanning' ? (
            <ScanningScreen imageUri={flow.imageUri} onCancel={() => close()} />
          ) : (
            <ReviewScreen key={flow.runId} initial={flow.draft} imageUri={flow.imageUri} onBack={() => close()} onSave={save} />
          )}
        </SlideIn>
      )}
      <Toast toast={toast} bottom={flow.step === 'list' ? 104 : 210} />
    </View>
  );
}

/** On wide web viewports, show the app inside a phone-sized frame. */
function Frame({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web' || width < 560) return <View style={styles.fill}>{children}</View>;
  return (
    <View style={styles.webBackdrop}>
      <View style={styles.webPhone}>{children}</View>
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });
  if (!loaded) return <View style={[styles.fill, { backgroundColor: colors.bg }]} />;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ExpensesProvider>
        <Frame>
          <Root />
        </Frame>
      </ExpensesProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  webBackdrop: { flex: 1, backgroundColor: '#E2DED3', alignItems: 'center', justifyContent: 'center' },
  webPhone: {
    width: 393, height: 852, maxHeight: '96%', backgroundColor: colors.bg, borderRadius: 36, overflow: 'hidden',
    borderWidth: 1, borderColor: '#CFCABC',
  },
});
