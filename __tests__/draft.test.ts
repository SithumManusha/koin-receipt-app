import { draftFromExtraction, draftPricedCount, draftReducer, draftTotalCents } from '../src/domain/draft';
import { validateDraft } from '../src/domain/validation';
import { formatDateLong, activityLabel, addDaysISO, isValidISODate } from '../src/domain/date';
import { nextPreset, presetCount } from '../src/services/extraction/presets';
import { parseGeminiPayload } from '../src/services/extraction/gemini';
import type { Draft } from '../src/domain/types';

const NOW = new Date(2026, 10, 24, 12, 0, 0); // Nov 24, 2026 local

const base = (): Draft => ({
  merchant: 'Cafe Kumbuk', date: '2026-11-24', category: 'food',
  items: [
    { id: 'a', name: 'Avocado toast', priceText: '14.00' },
    { id: 'b', name: 'Cappuccino', priceText: '6.50' },
    { id: 'c', name: 'Banana pancakes', priceText: '8.00' },
  ],
});

describe('draft reducer + total recalculation', () => {
  it('starts at $28.50', () => expect(draftTotalCents(base())).toBe(2850));

  it('recalculates when a price is edited', () => {
    const d = draftReducer(base(), { type: 'setItemPrice', id: 'b', value: '7.25' });
    expect(draftTotalCents(d)).toBe(2925);
  });

  it('handles in-progress typing like "7." and ""', () => {
    let d = draftReducer(base(), { type: 'setItemPrice', id: 'b', value: '7.' });
    expect(draftTotalCents(d)).toBe(2900);
    d = draftReducer(d, { type: 'setItemPrice', id: 'b', value: '' });
    expect(draftTotalCents(d)).toBe(2200);
    expect(draftPricedCount(d)).toBe(2);
  });

  it('removes an item and the total drops', () => {
    const d = draftReducer(base(), { type: 'removeItem', id: 'a' });
    expect(d.items).toHaveLength(2);
    expect(draftTotalCents(d)).toBe(1450);
  });

  it('adds a blank item without changing the total, then counts it once priced', () => {
    let d = draftReducer(base(), { type: 'addItem', id: 'n' });
    expect(d.items).toHaveLength(4);
    expect(draftTotalCents(d)).toBe(2850);
    d = draftReducer(d, { type: 'setItemPrice', id: 'n', value: '0.10' });
    d = draftReducer(d, { type: 'setItemPrice', id: 'n', value: '0.30' });
    expect(draftTotalCents(d)).toBe(2880);
  });

  it('sanitises negative / garbage input at the reducer level', () => {
    const d = draftReducer(base(), { type: 'setItemPrice', id: 'a', value: '-3x.999' });
    expect(d.items[0].priceText).toBe('3.99');
  });

  it('normalises on blur', () => {
    let d = draftReducer(base(), { type: 'setItemPrice', id: 'b', value: '6.5' });
    d = draftReducer(d, { type: 'blurItemPrice', id: 'b' });
    expect(d.items[1].priceText).toBe('6.50');
  });

  it('builds a draft from extraction', () => {
    const d = draftFromExtraction({ merchant: 'X', date: '2026-11-24', category: 'food', items: [{ name: 'A', priceCents: 1005 }] });
    expect(d.items[0].priceText).toBe('10.05');
  });
});

describe('validation', () => {
  it('accepts the valid mock-up draft', () => expect(validateDraft(base(), NOW).valid).toBe(true));

  it('rejects an empty / whitespace merchant', () => {
    const r = validateDraft({ ...base(), merchant: '   ' }, NOW);
    expect(r.valid).toBe(false);
    expect(r.errors.merchant).toBeDefined();
  });

  it('rejects no items', () => {
    const r = validateDraft({ ...base(), items: [] }, NOW);
    expect(r.errors.items).toBeDefined();
  });

  it('rejects zero total and zero/blank prices', () => {
    const d = base();
    d.items = [{ id: 'z', name: 'Free', priceText: '0.00' }];
    expect(validateDraft(d, NOW).errors.byItem.z.price).toBeDefined();
    d.items = [{ id: 'z', name: 'Blank', priceText: '' }];
    expect(validateDraft(d, NOW).errors.byItem.z.price).toBeDefined();
  });

  it('rejects negative prices that bypass the input filter', () => {
    const d = base();
    d.items[0].priceText = '-5.00';
    const r = validateDraft(d, NOW);
    expect(r.valid).toBe(false);
    expect(r.errors.byItem.a.price).toBeDefined();
  });

  it('rejects missing item names', () => {
    const d = base();
    d.items[1].name = ' ';
    expect(validateDraft(d, NOW).errors.byItem.b.name).toBeDefined();
  });

  it('rejects future and malformed dates', () => {
    expect(validateDraft({ ...base(), date: '2026-11-25' }, NOW).errors.date).toBeDefined();
    expect(validateDraft({ ...base(), date: '2026-02-31' }, NOW).errors.date).toBeDefined();
  });
});

describe('dates', () => {
  it('formats', () => expect(formatDateLong('2026-11-24')).toBe('Nov 24, 2026'));
  it('validates', () => { expect(isValidISODate('2026-02-29')).toBe(false); expect(isValidISODate('2028-02-29')).toBe(true); });
  it('labels activity', () => {
    expect(activityLabel('2026-11-24', '10:42', NOW)).toBe('Today, 10:42 AM');
    expect(activityLabel('2026-11-23', '18:18', NOW)).toBe('Yesterday, 6:18 PM');
    expect(activityLabel('2026-11-22', undefined, NOW)).toBe('Nov 22, 2026');
  });
  it('adds days across month boundaries', () => expect(addDaysISO('2026-12-01', -1)).toBe('2026-11-30'));
});

describe('extraction', () => {
  it('first simulated preset matches the mock-up receipt', () => {
    const r = nextPreset();
    expect(r.merchant).toBe('Cafe Kumbuk');
    expect(r.totalCents).toBe(2850);
  });
  it('every preset total equals the sum of its items', () => {
    for (let i = 0; i < presetCount; i++) {
      const r = nextPreset();
      expect(r.items.reduce((s, x) => s + x.priceCents, 0)).toBe(r.totalCents);
    }
  });
  it('parses and sanitises a Gemini payload', () => {
    const r = parseGeminiPayload('```json\n{"merchant":" Shop ","date":"2999-01-01","category":"nonsense","items":[{"name":"A","price":1.1},{"name":"Bad","price":-2},{"name":"B","price":2.2}],"total":3.3}\n```');
    expect(r.merchant).toBe('Shop');
    expect(r.category).toBe('other');
    expect(r.items.map((i) => i.priceCents)).toEqual([110, 220]);
    expect(r.totalCents).toBe(330);
    expect(r.date <= '2999').toBe(true);
    expect(r.date).not.toBe('2999-01-01');
  });
  it('throws when no usable items', () => {
    expect(() => parseGeminiPayload('{"merchant":"x","category":"food","items":[]}')).toThrow();
  });
});
