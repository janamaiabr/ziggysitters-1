/**
 * Multi-currency support for NZ and AU markets
 */

export type CurrencyCode = 'NZD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  country: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  NZD: { code: 'NZD', symbol: '$', label: 'NZD', country: 'New Zealand' },
  AUD: { code: 'AUD', symbol: '$', label: 'AUD', country: 'Australia' },
};

const AU_CITIES = [
  'sunshine coast', 'maroochydore', 'buderim', 'noosa', 'caloundra',
  'coolum', 'mooloolaba', 'nambour', 'noosa heads', 'noosaville',
  'sippy downs', 'kawana', 'birtinya', 'palmwoods', 'maleny',
  'montville', 'beerwah', 'landsborough', 'eumundi', 'yandina',
];

/**
 * Detect currency from a sitter's city or suburb
 */
export function getCurrencyFromLocation(city?: string | null, suburb?: string | null): CurrencyCode {
  const location = `${city || ''} ${suburb || ''}`.toLowerCase();
  if (AU_CITIES.some(c => location.includes(c))) {
    return 'AUD';
  }
  return 'NZD';
}

/**
 * Format an amount with the correct currency symbol and code
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'NZD'): string {
  const config = CURRENCIES[currency];
  return `${config.symbol}${amount.toFixed(2)} ${config.code}`;
}

/**
 * Get short currency display (e.g. "$50/night")
 */
export function formatRate(amount: number, currency: CurrencyCode = 'NZD', suffix?: string): string {
  const config = CURRENCIES[currency];
  const formatted = `${config.symbol}${Math.round(amount)}`;
  return suffix ? `${formatted}/${suffix}` : formatted;
}
