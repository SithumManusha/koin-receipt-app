import { todayISO, isValidISODate } from '../../domain/date';
import { CATEGORIES, isCategoryId } from '../../domain/categories';
import { centsFromNumber } from '../../domain/money';
import type { ExtractedReceipt } from '../../domain/types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';
const TIMEOUT_MS = 25_000;

export const isLiveExtractionConfigured = (): boolean => !!API_KEY && API_KEY.trim().length > 0;

const PROMPT = `You extract structured data from a photo of a receipt.
Return JSON only, matching the schema. Rules:
- merchant: the store / vendor name as printed.
- date: purchase date as YYYY-MM-DD, or null if not readable.
- category: the single best fit from: ${CATEGORIES.map((c) => c.id).join(', ')}.
- items: every purchased line item with its name and final price as a plain decimal number (no currency symbol).
  If the receipt shows tax, a service charge, a delivery fee or a tip, include each as its own item so the item prices add up to the receipt total. Never output negative prices; skip discount lines.
- total: the grand total printed on the receipt as a decimal number, or null.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    merchant: { type: 'STRING' },
    date: { type: 'STRING', nullable: true },
    category: { type: 'STRING', enum: CATEGORIES.map((c) => c.id) },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { name: { type: 'STRING' }, price: { type: 'NUMBER' } },
        required: ['name', 'price'],
      },
    },
    total: { type: 'NUMBER', nullable: true },
  },
  required: ['merchant', 'category', 'items'],
};

/** Validate + normalise whatever the model returned. Throws if unusable. */
export function parseGeminiPayload(text: string): ExtractedReceipt {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const raw = JSON.parse(cleaned);

  const items = Array.isArray(raw.items)
    ? raw.items
        .filter((i: any) => i && typeof i.name === 'string' && typeof i.price === 'number' && isFinite(i.price) && i.price > 0)
        .map((i: any) => ({ name: String(i.name).trim().slice(0, 80), priceCents: centsFromNumber(i.price) }))
    : [];
  if (items.length === 0) throw new Error('No line items found');

  return {
    merchant: typeof raw.merchant === 'string' ? raw.merchant.trim().slice(0, 80) : '',
    date: typeof raw.date === 'string' && isValidISODate(raw.date) && raw.date <= todayISO() ? raw.date : todayISO(),
    category: isCategoryId(raw.category) ? raw.category : 'other',
    items,
    totalCents: typeof raw.total === 'number' && isFinite(raw.total) ? centsFromNumber(raw.total) : undefined,
  };
}

export async function extractWithGemini(
  base64: string,
  mimeType: string,
  signal?: AbortSignal,
): Promise<ExtractedReceipt> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  signal?.addEventListener('abort', () => controller.abort());

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY! },
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data: base64 } }] }],
          generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA, temperature: 0 },
        }),
        signal: controller.signal,
      },
    );
    if (!res.ok) throw new Error(`Gemini request failed (${res.status})`);
    const json = await res.json();
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return parseGeminiPayload(text);
  } finally {
    clearTimeout(timer);
  }
}
