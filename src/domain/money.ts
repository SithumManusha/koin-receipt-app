/**
 * Money helpers. All arithmetic happens on integer cents; floats are never
 * summed. Text <-> cents conversion is done on the decimal string itself.
 */

const MAX_INT_DIGITS = 7; // up to 9,999,999.99

/** Restrict free-form typing to a valid in-progress amount like "12", "12.", "12.5", ".5". */
export function sanitizeAmountInput(raw: string): string {
  let s = raw.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const firstDot = s.indexOf('.');
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
  }
  const [intPart, decPart] = s.split('.');
  const int = intPart.replace(/^0+(?=\d)/, '').slice(0, MAX_INT_DIGITS);
  return decPart === undefined ? int : `${int}.${decPart.slice(0, 2)}`;
}

/** "14.5" -> 1450. Returns null for empty / non-numeric / >2 decimals. */
export function parseCents(text: string): number | null {
  const t = text.trim().replace(/^\$/, '');
  if (!/^\d*\.?\d*$/.test(t) || t === '' || t === '.') return null;
  const [intPart = '', decPart = ''] = t.split('.');
  if (decPart.length > 2) return null;
  const cents = parseInt(intPart || '0', 10) * 100 + parseInt((decPart + '00').slice(0, 2), 10);
  return Number.isSafeInteger(cents) ? cents : null;
}

/** 2850 -> "$28.50", 123456 -> "$1,234.56", -500 -> "-$5.00" */
export function formatCents(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const whole = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = (abs % 100).toString().padStart(2, '0');
  return `${negative ? '-' : ''}$${whole}.${frac}`;
}

/** 1450 -> "14.50" (for putting back into an input). */
export function centsToInputText(cents: number): string {
  const abs = Math.abs(cents);
  return `${Math.floor(abs / 100)}.${(abs % 100).toString().padStart(2, '0')}`;
}

/** Normalise "6.5" -> "6.50" on blur; leave empty/invalid text untouched. */
export function normalizePriceText(text: string): string {
  const cents = parseCents(text);
  return cents === null ? text : centsToInputText(cents);
}

/** Convert an API-provided decimal number (e.g. 6.5) to cents. Boundary-only use. */
export function centsFromNumber(n: number): number {
  return Math.round(n * 100);
}

/** Exact sum of amounts given as input text; unparseable entries count as 0. */
export function sumPriceTexts(texts: string[]): number {
  return texts.reduce((sum, t) => sum + (parseCents(t) ?? 0), 0);
}
