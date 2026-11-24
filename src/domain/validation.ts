import { isValidISODate, todayISO } from './date';
import { draftTotalCents } from './draft';
import { parseCents } from './money';
import type { Draft } from './types';

export interface ItemErrors {
  name?: string;
  price?: string;
}

export interface DraftErrors {
  merchant?: string;
  date?: string;
  /** Problems with the item list as a whole (e.g. no items). */
  items?: string;
  total?: string;
  byItem: Record<string, ItemErrors>;
}

export interface ValidationResult {
  valid: boolean;
  errors: DraftErrors;
  /** Human-readable, in on-screen order — the first one is shown to the user. */
  messages: string[];
}

export function validateDraft(draft: Draft, now: Date = new Date()): ValidationResult {
  const errors: DraftErrors = { byItem: {} };
  const messages: string[] = [];
  const fail = (msg: string) => messages.push(msg);

  if (draft.merchant.trim().length === 0) {
    errors.merchant = 'Merchant name is required';
    fail(errors.merchant);
  }

  if (!isValidISODate(draft.date)) {
    errors.date = 'Pick a valid date';
    fail(errors.date);
  } else if (draft.date > todayISO(now)) {
    errors.date = 'Date can’t be in the future';
    fail(errors.date);
  }

  if (draft.items.length === 0) {
    errors.items = 'Add at least one item';
    fail(errors.items);
  }

  for (const item of draft.items) {
    const e: ItemErrors = {};
    if (item.name.trim().length === 0) e.name = 'Item name is required';
    const cents = parseCents(item.priceText);
    if (cents === null) e.price = 'Enter a price';
    else if (cents <= 0) e.price = 'Price must be above $0.00';
    if (e.name || e.price) {
      errors.byItem[item.id] = e;
      fail(e.name && e.price ? 'Fill in every item’s name and price' : (e.name ?? e.price)!);
    }
  }

  if (draft.items.length > 0 && Object.keys(errors.byItem).length === 0) {
    if (draftTotalCents(draft) <= 0) {
      errors.total = 'Total must be greater than $0.00';
      fail(errors.total);
    }
  }

  return { valid: messages.length === 0, errors, messages };
}
