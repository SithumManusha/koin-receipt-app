import type { ExtractedReceipt, ExtractionSource } from '../../domain/types';
import { extractWithGemini, isLiveExtractionConfigured } from './gemini';
import { nextPreset } from './presets';

export interface ReceiptImage {
  uri: string;
  base64?: string | null;
  mimeType?: string | null;
}

export interface ExtractionResult {
  receipt: ExtractedReceipt;
  source: ExtractionSource;
  /** Set when live extraction was attempted but we fell back. */
  fallbackReason?: string;
}

const SIMULATED_DELAY_MS = 2200;
const MIN_LIVE_DISPLAY_MS = 1500;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Extract receipt fields. Uses Gemini when EXPO_PUBLIC_GEMINI_API_KEY is set
 * and an image is available; otherwise (or on any failure) falls back to a
 * realistic simulated extraction so the flow always works.
 */
export async function extractReceipt(image: ReceiptImage | null, signal?: AbortSignal): Promise<ExtractionResult> {
  const started = Date.now();

  if (image?.base64 && isLiveExtractionConfigured()) {
    try {
      const receipt = await extractWithGemini(image.base64, image.mimeType || 'image/jpeg', signal);
      const elapsed = Date.now() - started;
      if (elapsed < MIN_LIVE_DISPLAY_MS) await wait(MIN_LIVE_DISPLAY_MS - elapsed);
      return { receipt, source: 'live' };
    } catch (err) {
      if (signal?.aborted) throw err;
      const reason = err instanceof Error ? err.message : 'Live extraction failed';
      await wait(Math.max(0, SIMULATED_DELAY_MS - (Date.now() - started)));
      return { receipt: nextPreset(), source: 'simulated', fallbackReason: reason };
    }
  }

  await wait(SIMULATED_DELAY_MS);
  return { receipt: nextPreset(), source: 'simulated' };
}
