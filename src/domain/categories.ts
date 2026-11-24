import type { CategoryId } from './types';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  /** MaterialCommunityIcons glyph */
  icon: string;
  /** Soft pastel badge background */
  tint: string;
  /** Icon colour on the badge */
  fg: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'food', label: 'Food & Dining', icon: 'coffee-outline', tint: '#D9F2E6', fg: '#0E9F6E' },
  { id: 'groceries', label: 'Groceries', icon: 'basket-outline', tint: '#E9E3F8', fg: '#7351C4' },
  { id: 'transport', label: 'Transport', icon: 'car-outline', tint: '#DCEAFA', fg: '#2563A8' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-outline', tint: '#FBE8D6', fg: '#B5671F' },
  { id: 'bills', label: 'Bills & Utilities', icon: 'lightning-bolt-outline', tint: '#FDF3C8', fg: '#A16207' },
  { id: 'health', label: 'Health', icon: 'heart-pulse', tint: '#FCE1E4', fg: '#BE3B52' },
  { id: 'entertainment', label: 'Entertainment', icon: 'movie-open-outline', tint: '#E0E7FF', fg: '#4F46E5' },
  { id: 'other', label: 'Other', icon: 'dots-horizontal-circle-outline', tint: '#E8E8E4', fg: '#57534E' },
];

const BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryMeta>;

export const getCategory = (id: CategoryId): CategoryMeta => BY_ID[id] ?? BY_ID.other;
export const isCategoryId = (v: unknown): v is CategoryId => typeof v === 'string' && v in BY_ID;
