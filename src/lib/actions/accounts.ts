'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AccountWithBalance } from '@/types/database';

export async function getAccounts(_simDateStr?: string): Promise<AccountWithBalance[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!accounts) return [];

  // Calculate current balance for each account in parallel
  const results = await Promise.all(
    accounts.map(async (account) => {
      const balance = await calculateAccountBalance(account.id, account.opening_balance);
      const change = balance - account.opening_balance;
      const changePct = account.opening_balance > 0
        ? ((balance - account.opening_balance) / account.opening_balance) * 100
        : 0;

      return {
        ...account,
        current_balance: balance,
        balance_change: change,
        balance_change_pct: changePct,
      };
    })
  );

  return results;
}

export async function calculateAccountBalance(accountId: string, openingBalance: number): Promise<number> {
  const supabase = await createClient();

  // Fetch all transaction aggregates in parallel to optimize speed
  const [incomesRes, expensesRes, transfersOutRes, transfersInRes, adjustmentsRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount, paid_amount, status')
      .eq('account_id', accountId)
      .eq('type', 'income')
      .in('status', ['paid', 'partial']),
    supabase
      .from('transactions')
      .select('amount, paid_amount, status')
      .eq('account_id', accountId)
      .eq('type', 'expense')
      .in('status', ['paid', 'partial']),
    supabase
      .from('transactions')
      .select('amount, paid_amount, status')
      .eq('account_id', accountId)
      .eq('type', 'transfer')
      .in('status', ['paid', 'partial']),
    supabase
      .from('transactions')
      .select('amount, paid_amount, status')
      .eq('destination_account_id', accountId)
      .eq('type', 'transfer')
      .in('status', ['paid', 'partial']),
    supabase
      .from('transactions')
      .select('amount, paid_amount, status')
      .eq('account_id', accountId)
      .eq('type', 'adjustment')
      .in('status', ['paid', 'partial']),
  ]);

  const totalIncomes = (incomesRes.data || []).reduce((sum, tx) => sum + (tx.status === 'partial' ? (tx.paid_amount ?? 0) : tx.amount), 0);
  const totalExpenses = (expensesRes.data || []).reduce((sum, tx) => sum + (tx.status === 'partial' ? (tx.paid_amount ?? 0) : tx.amount), 0);
  const totalTransfersOut = (transfersOutRes.data || []).reduce((sum, tx) => sum + (tx.status === 'partial' ? (tx.paid_amount ?? 0) : tx.amount), 0);
  const totalTransfersIn = (transfersInRes.data || []).reduce((sum, tx) => sum + (tx.status === 'partial' ? (tx.paid_amount ?? 0) : tx.amount), 0);
  const totalAdjustments = (adjustmentsRes.data || []).reduce((sum, tx) => sum + (tx.status === 'partial' ? (tx.paid_amount ?? 0) : tx.amount), 0);

  return openingBalance + totalIncomes - totalExpenses - totalTransfersOut + totalTransfersIn + totalAdjustments;
}

export async function createAccount(data: {
  name: string;
  type: string;
  opening_balance: number;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مسجل دخول');

  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name: data.name,
    type: data.type,
    opening_balance: data.opening_balance,
    notes: data.notes || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/accounts');
  revalidatePath('/');
}

export async function updateAccount(id: string, data: {
  name: string;
  type: string;
  opening_balance?: number;
  notes?: string;
}) {
  const supabase = await createClient();

  const updateData: any = {
    name: data.name,
    type: data.type,
    notes: data.notes || null,
    updated_at: new Date().toISOString(),
  };

  if (typeof data.opening_balance === 'number') {
    updateData.opening_balance = data.opening_balance;
  }

  const { error } = await supabase
    .from('accounts')
    .update(updateData)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/accounts');
  revalidatePath('/');
}

export async function deleteAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/accounts');
  revalidatePath('/');
}

export async function updateBankBalance(newBalance: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مسجل دخول');

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'bank')
    .limit(1);

  const bankAccount = accounts?.[0];
  if (!bankAccount) throw new Error('لم يتم العثور على حساب البنك');

  // Calculate computed balance from transactions (without opening balance)
  const currentComputed = await calculateAccountBalance(bankAccount.id, 0);

  // Set opening balance so that:
  // newBalance = newOpeningBalance + currentComputed
  // newOpeningBalance = newBalance - currentComputed
  const newOpeningBalance = newBalance - currentComputed;

  const { error } = await supabase
    .from('accounts')
    .update({ opening_balance: newOpeningBalance, updated_at: new Date().toISOString() })
    .eq('id', bankAccount.id);

  if (error) throw new Error(error.message);
  revalidatePath('/accounts');
  revalidatePath('/');
}

export async function resetAllData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مسجل دخول');

  // Delete all user records from relevant tables
  await Promise.all([
    supabase.from('transactions').delete().eq('user_id', user.id),
    supabase.from('monthly_commitments').delete().eq('user_id', user.id),
    supabase.from('projects').delete().eq('user_id', user.id),
    supabase.from('monthly_targets').delete().eq('user_id', user.id),
    supabase.from('people').delete().eq('user_id', user.id),
    supabase.from('accounts').delete().eq('user_id', user.id),
  ]);

  // Create default bank account with 0 balance
  const { error: accErr } = await supabase.from('accounts').insert({
    user_id: user.id,
    name: 'حساب البنك الرئيسي',
    type: 'bank',
    opening_balance: 0,
    currency: 'EGP',
    notes: 'الحساب الرئيسي للعمليات والالتزامات',
  });

  if (accErr) throw new Error(accErr.message);

  revalidatePath('/');
  revalidatePath('/accounts');
  revalidatePath('/transactions');
  revalidatePath('/commitments');
  revalidatePath('/digi-whale');
}
