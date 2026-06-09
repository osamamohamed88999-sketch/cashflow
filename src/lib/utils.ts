/**
 * Format number as EGP currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' EGP';
}

/**
 * Format number with commas (no currency)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

/**
 * Format date to English locale
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format date short
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Get month name in English
 */
export function getMonthName(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
}

/**
 * Get the cycle month string (YYYY-MM) for a given date.
 * Cycle resets on the 5th of each month.
 */
export function getCycleMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();

  if (day >= 5) {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  } else {
    const prev = new Date(year, month - 1, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  }
}

/**
 * Get date range (start inclusive, end exclusive) for a cycle month string.
 */
export function getCycleDateRange(monthStr: string): { start: string; end: string } {
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10) - 1; // 0-indexed

  const startStr = `${year}-${String(month + 1).padStart(2, '0')}-05`;
  const nextDate = new Date(year, month + 1, 5);
  const endStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-05`;
  return { start: startStr, end: endStr };
}

/**
 * Get current month start date
 */
export function getCurrentMonthStart(): string {
  const currentCycle = getCycleMonth(new Date());
  return getCycleDateRange(currentCycle).start;
}

/**
 * Get current month end date
 */
export function getCurrentMonthEnd(): string {
  const currentCycle = getCycleMonth(new Date());
  const range = getCycleDateRange(currentCycle);
  const endDate = new Date(range.end);
  endDate.setDate(endDate.getDate() - 1);
  return `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
}

/**
 * Merge class names (simple utility)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Transaction type labels in Arabic
 */
export const transactionTypeLabels: Record<string, string> = {
  income: 'دخل',
  expense: 'مصروف',
  transfer: 'تحويل',
  adjustment: 'تسوية',
};

/**
 * Account type labels in Arabic
 */
export const accountTypeLabels: Record<string, string> = {
  bank: 'حساب بنكي',
  cash: 'نقدي',
  wallet: 'محفظة',
  business: 'حساب عمل',
};

/**
 * Status labels in Arabic
 */
export const statusLabels: Record<string, string> = {
  paid: 'مدفوع',
  pending: 'معلق',
  partial: 'جزئي',
};

/**
 * Project status labels in Arabic
 */
export const projectStatusLabels: Record<string, string> = {
  lead: 'فرصة',
  active: 'نشط',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

/**
 * Bucket labels in Arabic
 */
export const bucketLabels: Record<string, string> = {
  personal: 'شخصي',
  digi_whale: 'Digi Whale',
};
