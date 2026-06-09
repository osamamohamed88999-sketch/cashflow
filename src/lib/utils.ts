/**
 * Format number as EGP currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' ج.م';
}

/**
 * Format number with commas (no currency)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-EG').format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

/**
 * Format date to Arabic locale
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-EG', {
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
  return new Intl.DateTimeFormat('ar-EG', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Get month name in Arabic
 */
export function getMonthName(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-EG', { month: 'long' }).format(date);
}

/**
 * Get current month start date (YYYY-MM-01)
 */
export function getCurrentMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Get current month end date
 */
export function getCurrentMonthEnd(): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
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
