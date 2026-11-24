import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const run = (fn: () => Promise<unknown>) => {
  if (Platform.OS === 'web') return;
  fn().catch(() => {});
};

export const haptic = {
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
