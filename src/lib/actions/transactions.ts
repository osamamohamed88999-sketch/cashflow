'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TransactionWithRelations } from '@/types/database';

export async function getTransactions(filters?: {
  month?: string;
  account_id?: string;
  bucket?: string;
  type?: string;
  category_id?: string;
}): Promise<TransactionWithRelations[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('transactions')
    .select(`
      *,
      account:accounts!transactions_account_id_fkey(*),
      destination_account:accounts!transactions_destination_account_id_fkey(*),
      category:categories(*),
      project:projects(*),
      person:people(*)
    `)
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters?.month) {
    const monthStart = `${filters.month}-01`;
    const monthDate = new Date(filters.month + '-01');
    const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    const monthEnd = nextMonth.toISOString().split('T')[0];
    query = query.gte('date', monthStart).lt('date', monthEnd);
  }

  if (filters?.account_id) {
    query = query.eq('account_id', filters.account_id);
  }

  if (filters?.bucket) {
    query = query.eq('bucket', filters.bucket);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  const { data } = await query.limit(200);
  return (data as TransactionWithRelations[]) || [];
}

export async function createTransaction(data: {
  date: string;
  type: string;
  account_id: string;
  destination_account_id?: string | null;
  amount: number;
  paid_amount?: number | null;
  category_id?: string | null;
  project_id?: string | null;
  person_id?: string | null;
  bucket: string;
  status: string;
  notes?: string;
  is_recurring: boolean;
  adjustment_reason?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مسجل دخول');

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    date: data.date,
    type: data.type,
    account_id: data.account_id,
    destination_account_id: data.destination_account_id || null,
    amount: data.amount,
    paid_amount: data.status === 'partial' ? (data.paid_amount ?? 0) : null,
    category_id: data.category_id || null,
    project_id: data.project_id || null,
    person_id: data.person_id || null,
    bucket: data.bucket,
    status: data.status,
    notes: data.notes || null,
    is_recurring: data.is_recurring,
    adjustment_reason: data.adjustment_reason || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/accounts');
  revalidatePath('/digi-whale');
  revalidatePath('/commitments');
  revalidatePath('/targets');
}

export async function updateTransaction(id: string, data: {
  date: string;
  type: string;
  account_id: string;
  destination_account_id?: string | null;
  amount: number;
  paid_amount?: number | null;
  category_id?: string | null;
  project_id?: string | null;
  person_id?: string | null;
  bucket: string;
  status: string;
  notes?: string;
  is_recurring: boolean;
  adjustment_reason?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('transactions')
    .update({
      date: data.date,
      type: data.type,
      account_id: data.account_id,
      destination_account_id: data.destination_account_id || null,
      amount: data.amount,
      paid_amount: data.status === 'partial' ? (data.paid_amount ?? 0) : null,
      category_id: data.category_id || null,
      project_id: data.project_id || null,
      person_id: data.person_id || null,
      bucket: data.bucket,
      status: data.status,
      notes: data.notes || null,
      is_recurring: data.is_recurring,
      adjustment_reason: data.adjustment_reason || null,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/accounts');
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/accounts');
}

export async function getMonthlyTotals(month: string, bucket?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { income: 0, expenses: 0, net: 0 };

  const monthStart = `${month}-01`;
  const monthDate = new Date(month + '-01');
  const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
  const monthEnd = nextMonth.toISOString().split('T')[0];

  let query = supabase
    .from('transactions')
    .select('type, amount, paid_amount, status')
    .eq('user_id', user.id)
    .gte('date', monthStart)
    .lt('date', monthEnd)
    .in('status', ['paid', 'partial']);

  if (bucket) {
    query = query.eq('bucket', bucket);
  }

  const { data } = await query;
  if (!data) return { income: 0, expenses: 0, net: 0 };

  let income = 0;
  let expenses = 0;

  data.forEach((tx) => {
    const effective = tx.status === 'partial' ? (tx.paid_amount ?? 0) : tx.amount;
    if (tx.type === 'income') income += effective;
    if (tx.type === 'expense') expenses += effective;
  });

  return { income, expenses, net: income - expenses };
}
