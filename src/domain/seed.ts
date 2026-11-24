import type { Expense } from './types';

/** Mirrors the "Recent Activity" list in the design mock-up. */
export const SEED_EXPENSES: Expense[] = [
  {
    id: 'seed_1', merchant: 'Cafe Kumbuk', category: 'food', date: '2026-11-24', time: '10:42',
    totalCents: 2850, createdAt: 4,
    items: [
      { name: 'Avocado toast', priceCents: 1400 },
      { name: 'Cappuccino', priceCents: 650 },
      { name: 'Banana pancakes', priceCents: 800 },
    ],
  },
  {
    id: 'seed_2', merchant: 'Keells Super', category: 'groceries', date: '2026-11-23', time: '18:18',
    totalCents: 6420, createdAt: 3, items: [{ name: 'Weekly groceries', priceCents: 6420 }],
  },
  {
    id: 'seed_3', merchant: 'Uber', category: 'transport', date: '2026-11-22',
    totalCents: 1280, createdAt: 2, items: [{ name: 'Trip fare', priceCents: 1280 }],
  },
  {
    id: 'seed_4', merchant: 'The Good Market', category: 'shopping', date: '2026-11-21',
    totalCents: 3500, createdAt: 1, items: [{ name: 'Market purchase', priceCents: 3500 }],
  },
];

export function sortExpenses(list: Expense[]): Expense[] {
  return [...list].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1));
}
