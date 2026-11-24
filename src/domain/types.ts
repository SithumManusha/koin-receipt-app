export type CategoryId =
  | 'food'
  | 'groceries'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'health'
  | 'entertainment'
  | 'other';

/** A saved line item. Money is ALWAYS integer cents. */
export interface LineItem {
  name: string;
  priceCents: number;
}

export interface Expense {
  id: string;
  merchant: string;
  category: CategoryId;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  /** Local time of day, HH:mm (optional). */
  time?: string;
  totalCents: number;
  items: LineItem[];
  createdAt: number;
}

/**
 * An in-progress line item on the review screen. The price is kept as the
 * text the user is typing ("14.", "6.5") so the input never fights them;
 * cents are derived from it.
 */
export interface DraftItem {
  id: string;
  name: string;
  priceText: string;
}

export type ExtractionSource = 'live' | 'simulated';

export interface Draft {
  merchant: string;
  date: string;
  category: CategoryId;
  items: DraftItem[];
}

/** What an extractor (live API or simulated) returns. */
export interface ExtractedReceipt {
  merchant: string;
  date: string;
  category: CategoryId;
  items: LineItem[];
  /** The total printed on the receipt, if it could be read. */
  totalCents?: number;
}
