'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Account, AccountWithBalance } from '@/types/database';

export async function getAccounts(): Promise<AccountWithBalance[]> {
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

  const incomes = incomesRes.data || [];
  const expenses = expensesRes.data || [];
  const transfersOut = transfersOutRes.data || [];
  const transfersIn = transfersInRes.data || [];
  const adjustments = adjustmentsRes.data || [];

  const getEffective = (tx: { amount: number; paid_amount: number | null; status: string }) =>
    tx.status === 'partial' ? (tx.paid_amount ?? 0) : tx.amount;

  const totalIncome = incomes.reduce((sum, tx) => sum + getEffective(tx), 0);
  const totalExpense = expenses.reduce((sum, tx) => sum + getEffective(tx), 0);
  const totalTransferOut = transfersOut.reduce((sum, tx) => sum + getEffective(tx), 0);
  const totalTransferIn = transfersIn.reduce((sum, tx) => sum + getEffective(tx), 0);
  const totalAdjustment = adjustments.reduce((sum, tx) => sum + getEffective(tx), 0);

  return openingBalance + totalIncome - totalExpense - totalTransferOut + totalTransferIn + totalAdjustment;
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
