import { normalizePriceText, parseCents, sanitizeAmountInput, sumPriceTexts } from './money';
import type { CategoryId, Draft, DraftItem, ExtractedReceipt } from './types';
import { centsToInputText } from './money';

let counter = 0;
export const uid = (prefix = 'id'): string =>
  `${prefix}_${Date.now().toString(36)}_${(counter++).toString(36)}`;

export function draftFromExtraction(r: ExtractedReceipt): Draft {
  return {
    merchant: r.merchant,
    date: r.date,
    category: r.category,
    items: r.items.map((i) => ({ id: uid('item'), name: i.name, priceText: centsToInputText(i.priceCents) })),
  };
}

export type DraftAction =
  | { type: 'setMerchant'; value: string }
  | { type: 'setDate'; value: string }
  | { type: 'setCategory'; value: CategoryId }
  | { type: 'setItemName'; id: string; value: string }
  | { type: 'setItemPrice'; id: string; value: string }
  | { type: 'blurItemPrice'; id: string }
  | { type: 'addItem'; id: string }
  | { type: 'removeItem'; id: string };

const mapItem = (items: DraftItem[], id: string, fn: (i: DraftItem) => DraftItem) =>
  items.map((i) => (i.id === id ? fn(i) : i));

export function draftReducer(state: Draft, action: DraftAction): Draft {
  switch (action.type) {
    case 'setMerchant':
      return { ...state, merchant: action.value };
    case 'setDate':
      return { ...state, date: action.value };
    case 'setCategory':
      return { ...state, category: action.value };
    case 'setItemName':
      return { ...state, items: mapItem(state.items, action.id, (i) => ({ ...i, name: action.value })) };
    case 'setItemPrice':
      return {
        ...state,
        items: mapItem(state.items, action.id, (i) => ({ ...i, priceText: sanitizeAmountInput(action.value) })),
      };
    case 'blurItemPrice':
      return {
        ...state,
        items: mapItem(state.items, action.id, (i) => ({ ...i, priceText: normalizePriceText(i.priceText) })),
      };
    case 'addItem':
      return { ...state, items: [...state.items, { id: action.id, name: '', priceText: '' }] };
    case 'removeItem':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    default:
      return state;
  }
}

/** Total in integer cents, derived from the items — never stored separately. */
export const draftTotalCents = (d: Draft): number => sumPriceTexts(d.items.map((i) => i.priceText));

/** Count of items that actually contribute (have a valid price). */
export const draftPricedCount = (d: Draft): number => d.items.filter((i) => parseCents(i.priceText) !== null).length;
