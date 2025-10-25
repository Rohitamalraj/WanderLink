import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format HBAR amount with proper decimals
 */
export function formatHbar(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(amount);
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Truncate account ID for display
 */
export function truncateAccountId(accountId: string, chars: number = 10): string {
  if (accountId.length <= chars) return accountId;
  return `${accountId.substring(0, chars)}...`;
}

/**
 * Calculate estimated staking rewards
 */
export function calculateRewards(amount: number, apy: number = 0.05, days: number = 30): number {
  return (amount * apy * days) / 365;
}

/**
 * Validate Hedera account ID format
 */
export function isValidAccountId(accountId: string): boolean {
  const pattern = /^0\.0\.\d+$/;
  return pattern.test(accountId);
}

/**
 * Validate HBAR amount
 */
export function isValidAmount(amount: number, min: number = 10, max: number = 10000): boolean {
  return typeof amount === 'number' && 
         Number.isFinite(amount) && 
         amount >= min && 
         amount <= max;
}
