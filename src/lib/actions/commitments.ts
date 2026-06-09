'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CommitmentWithStatus } from '@/types/database';
import { getCurrentMonthStart, getCurrentMonthEnd } from '@/lib/utils';

export async function getCommitmentsWithStatus(): Promise<CommitmentWithStatus[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: commitments } = await supabase
    .from('monthly_commitments')
    .select(`*, category:categories(*), account:accounts(*)`)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('due_day');

  if (!commitments) return [];

  const monthStart = getCurrentMonthStart();
  const monthEnd = getCurrentMonthEnd();
  const today = new Date();
  const currentDay = today.getDate();

  const results: CommitmentWithStatus[] = [];

  for (const commitment of commitments) {
    // Find paid transactions matching this commitment's category this month
    let paidAmount = 0;

    if (commitment.category_id) {
      const { data: txns } = await supabase
        .from('transactions')
        .select('amount, paid_amount, status')
        .eq('user_id', user.id)
        .eq('category_id', commitment.category_id)
        .eq('type', 'expense')
        .eq('bucket', commitment.bucket)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .in('status', ['paid', 'partial']);

      paidAmount = (txns || []).reduce((sum, tx) => {
        return sum + (tx.status === 'partial' ? (tx.paid_amount ?? 0) : tx.amount);
      }, 0);
    }

    let status: CommitmentWithStatus['status'];
    if (paidAmount >= commitment.amount) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    } else if (currentDay > commitment.due_day) {
      status = 'overdue';
    } else {
      status = 'pending';
    }

    results.push({
      ...commitment,
      status,
      paid_amount: paidAmount,
      remaining: Math.max(0, commitment.amount - paidAmount),
    });
  }

  return results;
}

export async function createCommitment(data: {
  name: string;
  amount: number;
  category_id?: string | null;
  account_id?: string | null;
  due_day: number;
  bucket: string;
  commitment_type: string;
  is_active: boolean;
  auto_create: boolean;
  start_month?: string | null;
  end_month?: string | null;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مسجل دخول');

  const { error } = await supabase.from('monthly_commitments').insert({
    user_id: user.id,
    ...data,
    category_id: data.category_id || null,
    account_id: data.account_id || null,
    start_month: data.start_month || null,
    end_month: data.end_month || null,
    notes: data.notes || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/commitments');
  revalidatePath('/');
}

export async function updateCommitment(id: string, data: {
  name: string;
  amount: number;
  category_id?: string | null;
  account_id?: string | null;
  due_day: number;
  bucket: string;
  commitment_type: string;
  is_active: boolean;
  auto_create: boolean;
  notes?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('monthly_commitments')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/commitments');
  revalidatePath('/');
}

export async function deleteCommitment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('monthly_commitments').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/commitments');
  revalidatePath('/');
}
