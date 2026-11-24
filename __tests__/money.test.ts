import { centsToInputText, formatCents, normalizePriceText, parseCents, sanitizeAmountInput, sumPriceTexts } from '../src/domain/money';

describe('parseCents', () => {
  it.each([
    ['14', 1400], ['14.', 1400], ['14.5', 1450], ['14.50', 1450], ['.5', 50], ['0.07', 7], ['$8.00', 800], ['1234567.89', 123456789],
  ])('parses %s -> %d', (input, expected) => expect(parseCents(input)).toBe(expected));

  it.each([[''], ['.'], ['abc'], ['1.234'], ['-5'], ['1.2.3']])('rejects %p', (input) =>
    expect(parseCents(input)).toBeNull());
});

describe('exact arithmetic (no float drift)', () => {
  it('0.10 + 0.20 is exactly 30 cents', () => expect(sumPriceTexts(['0.10', '0.20'])).toBe(30));
  it('sums the mock-up receipt to $28.50', () => expect(formatCents(sumPriceTexts(['14.00', '6.50', '8.00']))).toBe('$28.50'));
  it('survives many tiny amounts', () => expect(sumPriceTexts(Array(1000).fill('0.01'))).toBe(1000));
  it('ignores blank/invalid prices', () => expect(sumPriceTexts(['5.00', '', 'x', '2.25'])).toBe(725));
});

describe('formatCents', () => {
  it.each([[0, '$0.00'], [5, '$0.05'], [2850, '$28.50'], [123456, '$1,234.56'], [-500, '-$5.00']])('%d -> %s', (c, s) =>
    expect(formatCents(c)).toBe(s));
});

describe('sanitizeAmountInput', () => {
  it.each([
    ['12', '12'], ['12.', '12.'], ['12.345', '12.34'], ['-5', '5'], ['1,5', '1.5'], ['1.2.3', '1.23'],
    ['007', '7'], ['abc', ''], ['.5', '.5'], ['123456789', '1234567'],
  ])('%p -> %p', (i, o) => expect(sanitizeAmountInput(i)).toBe(o));
});

describe('normalizePriceText / centsToInputText', () => {
  it('pads to 2 decimals', () => { expect(normalizePriceText('6.5')).toBe('6.50'); expect(normalizePriceText('8')).toBe('8.00'); });
  it('leaves empty alone', () => expect(normalizePriceText('')).toBe(''));
  it('formats cents for inputs', () => expect(centsToInputText(1405)).toBe('14.05'));
});
