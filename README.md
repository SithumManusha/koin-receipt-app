# Koin — Receipt Scan & Expense Review

React Native (**Expo SDK 58**) + **TypeScript** implementation of the Koin Receipt Scan & Expense Review flow: capture or upload a receipt, review and edit extracted line items with real-time total recalculation, validate edge cases, and save directly to the Recent Activity feed.

* **Expo Go Preview (iOS & Android):** [Launch via EAS Update (SDK 58)](https://expo.dev/preview/update?message=Koin+receipt+scan+and+expense+review&updateRuntimeVersion=exposdk%3A58.0.0&slug=exp&projectId=555bd0ff-ab34-40ce-9d6b-ebe6cb7fe224&group=76330e5f-f87a-4c0d-b869-b93a44d299f5)
* **Demo Video (48s):** [Watch walkthrough on Google Drive](https://drive.google.com/file/d/1HEegNSt2526Kgpuij4wffTkvPUCEjQaJ/view?usp=sharing)

---

## Quick Start

```bash
npm install
npx expo start          # Scan QR with Expo Go (iOS / Android), or press i / a / w
```

### Run Tests & Typecheck

```bash
npm test                # 59 unit tests (integer-cent math, reducer, validation, dates, extraction)
npm run typecheck       # Strict TypeScript check (0 errors)
```

### Optional: Live Multimodal Receipt Extraction

The app works completely out of the box without any API key using realistic sample receipt presets (`Cafe Kumbuk`, `Keells Super`, `Uber`, `The Good Market`). Tap **`+ Scan Bill` → `Use a sample receipt`** to test the full flow immediately on simulators or browsers.

To enable live OCR extraction via Google Gemini:

```bash
cp .env.example .env    # Set EXPO_PUBLIC_GEMINI_API_KEY
```

When configured with a key and receipt photo, the image is parsed into structured JSON via Gemini Vision (`gemini-2.5-flash`). If no key is provided or a network error occurs, extraction seamlessly falls back to local presets. *(In production, API calls would be proxied through a backend service rather than bundling a client key.)*

---

## Implemented Flow

| Feature | Implementation |
|---|---|
| **Expenses & Upload Screen** | `src/screens/ExpensesScreen.tsx`, `src/components/UploadCard.tsx`, `src/components/TabBar.tsx` |
| **Camera & Gallery Capture** | `App.tsx` (`expo-image-picker` with permission & simulator fallbacks) |
| **Animated Scanning State** | `src/screens/ScanningScreen.tsx` (receipt preview, sweep animation, cancel via `AbortController`) |
| **Extraction Engine** | `src/services/extraction/` (Gemini Vision structured JSON + automatic offline fallback) |
| **Interactive Review & Edit** | `src/screens/ReviewScreen.tsx`, `DatePickerSheet.tsx`, `CategorySheet.tsx`, `ReceiptThumb.tsx` (tap-to-zoom lightbox) |
| **Real-Time Precision Totals** | `src/domain/money.ts`, `src/domain/draft.ts` (integer-cent math, zero float drift) |
| **Validation & Save Feedback** | `src/domain/validation.ts`, `TotalBar.tsx`, `Toast.tsx` (shake animation, haptics, auto-scroll to error, row highlight) |
| **Mobile UX Polish** | `KeyboardAvoidingView` (`behavior="padding"`), `react-native-safe-area-context`, `tabular-nums`, Android hardware back |

---

## Architectural Choices

- **Integer-cent money end to end:** Price inputs preserve raw typing strings (`"14."`, `"6.5"`) so decimal entry never jumps; values are parsed directly from strings into integer cents (no `parseFloat` on user input) and summed cleanly (`$0.10 + $0.20 = $0.30`). The total is derived on render rather than stored separately, preventing sync drift.
- **Pure domain layer (`src/domain/`):** Currency math, draft reducer, validation rules, and `YYYY-MM-DD` date checks are decoupled from React Native UI so all 59 unit tests run fast and deterministically.
- **Timezone-safe dates & cross-platform sheets:** Storing dates as `YYYY-MM-DD` strings avoids timezone off-by-one shifts and allows blocking future dates cleanly. Custom bottom sheets for Calendar and Category ensure consistent UX across iOS, Android, and Web.
- **Lightweight state machine (`list → scanning → review`):** Keeps transitions fluid (`SlideIn` + `LayoutAnimation`) without unnecessary navigation boilerplate for a focused two-screen flow.

---

## Development Notes & AI Tooling

AI tools (**Claude Code** and **Google Antigravity / Gemini**) were used to accelerate scaffolding, extract Figma color/spacing tokens into `src/theme.ts`, and build a test-first domain layer (59 Jest tests) before wiring the screens.

Key issues caught and resolved during manual verification and native testing:
- **Native-only animation crash (`ExpenseRow.tsx`):** Running the full save flow on Android 16 surfaced a `Render Error` from mixing `useNativeDriver: true` (`opacity`/`translateY`) and `useNativeDriver: false` (`backgroundColor`) on the same `Animated.View` (which passed silently on Web). Refactored the save highlight into a dedicated native-driven opacity overlay so all animations run on the native UI thread.
- **Expo SDK 58 / React 19 type drift:** Strict `tsc --noEmit` caught outdated RN API usages (`StyleSheet.absoluteFillObject` and legacy ref types) prior to bundling.
- **Figma visual parity:** Side-by-side review against the design mockups caught white CTA text on primary emerald buttons (updated to `#0F172A`) and led to adding a tap-to-zoom receipt preview lightbox on `ReceiptThumb`.
- **EAS Update runtime compatibility:** Testing on a physical Android device with Expo Go SDK 58 caught a remote update failure caused by `runtimeVersion: appVersion` (`1.0.0`) and an unmapped `preview` channel; switched to `runtimeVersion: sdkVersion` (`exposdk:58.0.0`) and mapped the `preview` channel.

**Device Testing Note:** Verified end-to-end on a physical Android device and an Android 16 emulator via Expo Go (SDK 58), and recorded the 48s walkthrough natively on Android 16 (developed on Windows without local macOS/Xcode). Both iOS and Android Hermes bundles are published and ready to test immediately via the EAS Update preview link above.
