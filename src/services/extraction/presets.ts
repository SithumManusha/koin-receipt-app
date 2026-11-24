import { todayISO } from '../../domain/date';
import type { ExtractedReceipt } from '../../domain/types';

/** Realistic sample receipts used when no API key is configured. */
const PRESETS: Array<() => ExtractedReceipt> = [
  () => ({
    merchant: 'Cafe Kumbuk',
    date: todayISO(),
    category: 'food',
    items: [
      { name: 'Avocado toast', priceCents: 1400 },
      { name: 'Cappuccino', priceCents: 650 },
      { name: 'Banana pancakes', priceCents: 800 },
    ],
    totalCents: 2850,
  }),
  () => ({
    merchant: 'Keells Super',
    date: todayISO(),
    category: 'groceries',
    items: [
      { name: 'Basmati rice 1kg', priceCents: 480 },
      { name: 'Fresh milk 1L', priceCents: 320 },
      { name: 'Eggs (10 pack)', priceCents: 450 },
      { name: 'Bananas', priceCents: 290 },
      { name: 'Dishwash liquid', priceCents: 560 },
      { name: 'Coconut oil 500ml', priceCents: 1190 },
    ],
    totalCents: 3290,
  }),
  () => ({
    merchant: 'Uber',
    date: todayISO(),
    category: 'transport',
    items: [
      { name: 'Trip fare', priceCents: 1030 },
      { name: 'Booking fee', priceCents: 150 },
      { name: 'Tip', priceCents: 100 },
    ],
    totalCents: 1280,
  }),
  () => ({
    merchant: 'The Good Market',
    date: todayISO(),
    category: 'shopping',
    items: [
      { name: 'Linen tote bag', priceCents: 1800 },
      { name: 'Beeswax candle', priceCents: 950 },
      { name: 'Herbal soap', priceCents: 750 },
    ],
    totalCents: 3500,
  }),
];

let next = 0;

/** Cycles through presets so repeated scans show variety (first = the mock-up's receipt). */
export function nextPreset(): ExtractedReceipt {
  const preset = PRESETS[next % PRESETS.length]();
  next += 1;
  return preset;
}

export const presetCount = PRESETS.length;
