'use server';

import { createClient } from '@/lib/supabase/server';
import type { DashboardStats, CategoryBreakdown, SmartInsight } from '@/types/database';
import { getAccounts } from './accounts';
import { getMonthlyTotals } from './transactions';
import { getCommitmentsWithStatus } from './commitments';
import { formatCurrency } from '@/lib/utils';

export async function getDashboardStats(): Promise<DashboardStats> {
  const accounts = await getAccounts();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const allTotals = await getMonthlyTotals(currentMonth);
  const personalTotals = await getMonthlyTotals(currentMonth, 'personal');
  const digiWhaleTotals = await getMonthlyTotals(currentMonth, 'digi_whale');
  const commitments = await getCommitmentsWithStatus();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);

  const bankAccount = accounts.find((a) => a.type === 'bank');
  const personalBankBalance = bankAccount?.current_balance ?? 0;
  const bankOpeningBalance = bankAccount?.opening_balance ?? 0;
  const bankBalanceChange = personalBankBalance - bankOpeningBalance;
  const bankBalanceChangePct = bankOpeningBalance > 0
    ? ((personalBankBalance - bankOpeningBalance) / bankOpeningBalance) * 100
    : 0;

  const remainingCommitments = commitments
    .filter((c) => c.status !== 'paid')
    .reduce((sum, c) => sum + c.remaining, 0);

  // Calculate spending change vs last month
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().slice(0, 7);
  const lastMonthTotals = await getMonthlyTotals(lastMonthStr);
  const spendingChangePct = lastMonthTotals.expenses > 0
    ? ((allTotals.expenses - lastMonthTotals.expenses) / lastMonthTotals.expenses) * 100
    : 0;

  return {
    totalBalance,
    personalBankBalance,
    bankOpeningBalance,
    bankBalanceChange,
    bankBalanceChangePct,
    monthIncome: allTotals.income,
    monthExpenses: allTotals.expenses,
    monthNet: allTotals.net,
    digiWhaleIncome: digiWhaleTotals.income,
    digiWhaleExpenses: digiWhaleTotals.expenses,
    digiWhaleNet: digiWhaleTotals.net,
    remainingCommitments,
    spendingChangePct,
  };
}

export async function getCategoryBreakdown(month: string, type: 'expense' | 'income', bucket?: string): Promise<CategoryBreakdown[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const monthStart = `${month}-01`;
  const monthDate = new Date(month + '-01');
  const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
  const monthEnd = nextMonth.toISOString().split('T')[0];

  let query = supabase
    .from('transactions')
    .select(`amount, paid_amount, status, category:categories(name, icon, color)`)
    .eq('user_id', user.id)
    .eq('type', type)
    .gte('date', monthStart)
    .lt('date', monthEnd)
    .in('status', ['paid', 'partial']);

  if (bucket) query = query.eq('bucket', bucket);

  const { data: txns } = await query;
  if (!txns) return [];

  const catMap: Record<string, { name: string; icon: string; color: string; amount: number }> = {};

  txns.forEach((tx: any) => {
    const catName = tx.category?.name || 'بدون فئة';
    const catIcon = tx.category?.icon || '📦';
    const catColor = tx.category?.color || '#64748b';
    const effective = tx.status === 'partial' ? (tx.paid_amount ?? 0) : tx.amount;

    if (!catMap[catName]) {
      catMap[catName] = { name: catName, icon: catIcon, color: catColor, amount: 0 };
    }
    catMap[catName].amount += effective;
  });

  const results = Object.values(catMap).sort((a, b) => b.amount - a.amount);
  const total = results.reduce((sum, c) => sum + c.amount, 0);

  return results.map((c) => ({
    ...c,
    percentage: total > 0 ? Math.round((c.amount / total) * 100) : 0,
  }));
}

export async function getSmartInsights(): Promise<SmartInsight[]> {
  const stats = await getDashboardStats();
  const commitments = await getCommitmentsWithStatus();
  const insights: SmartInsight[] = [];

  // Monthly expenses insight
  if (stats.monthExpenses > 0) {
    insights.push({
      message: `مصروفاتك الشهرية وصلت إلى ${formatCurrency(stats.monthExpenses)}`,
      type: stats.monthExpenses > stats.monthIncome ? 'danger' : 'info',
      icon: '💸',
    });
  }

  // Bank balance change
  if (stats.bankBalanceChangePct !== 0) {
    const direction = stats.bankBalanceChangePct > 0 ? 'زاد' : 'نقص';
    insights.push({
      message: `رصيد البنك ${direction} ${Math.abs(stats.bankBalanceChangePct).toFixed(2)}% من بداية الشهر`,
      type: stats.bankBalanceChangePct > 0 ? 'success' : 'warning',
      icon: '🏦',
    });
  }

  // Digi Whale profit
  if (stats.digiWhaleNet !== 0) {
    insights.push({
      message: `Digi Whale صافي ربحها هذا الشهر ${formatCurrency(stats.digiWhaleNet)}`,
      type: stats.digiWhaleNet > 0 ? 'success' : 'danger',
      icon: '🐋',
    });
  }

  // Commitment insights
  const paidCommitments = commitments.filter((c) => c.status === 'paid');
  const overdueCommitments = commitments.filter((c) => c.status === 'overdue');

  paidCommitments.forEach((c) => {
    insights.push({
      message: `أنت خلصت ${c.name} بالكامل هذا الشهر ✅`,
      type: 'success',
      icon: '✅',
    });
  });

  overdueCommitments.forEach((c) => {
    insights.push({
      message: `باقي ${formatCurrency(c.remaining)} ${c.name} لم يتم دفعه`,
      type: 'danger',
      icon: '⚠️',
    });
  });

  // Spending change
  if (stats.spendingChangePct !== 0) {
    const direction = stats.spendingChangePct > 0 ? 'زادت' : 'قلت';
    insights.push({
      message: `مصروفاتك ${direction} بنسبة ${Math.abs(stats.spendingChangePct).toFixed(0)}% عن الشهر السابق`,
      type: stats.spendingChangePct > 20 ? 'warning' : 'info',
      icon: '📊',
    });
  }

  return insights;
}
