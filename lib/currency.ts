/**
 * Currency configuration and formatting utilities for Algerian Dinar (DZD)
 */

export const CURRENCY_CODE = 'DZD';
export const CURRENCY_LABEL = 'DZD';

/**
 * Formats a numeric amount into standard DZD currency representation.
 * Example: 1450.5 -> "1,450.50 DZD"
 */
export function formatCurrency(amount: number, showDecimals: boolean = true): string {
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `${value.toLocaleString('fr-DZ', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })} DZD`;
}
