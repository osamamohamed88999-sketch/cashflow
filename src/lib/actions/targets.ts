'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TargetWithProgress, TargetStatus } from '@/types/database';
import { getCycleDateRange } from '@/lib/utils';

export async function getTargetsWithProgress(month?: string): Promise<TargetWithProgress[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const targetMonth = month || new Date().toISOString().slice(0, 7) + '-01';

  const { data: targets } = await supabase
    .from('monthly_targets')
    .select(`*, category:categories(*)`)
    .eq('user_id', user.id)
    .eq('month', targetMonth);

  if (!targets) return [];

  const { start: monthStart, end: monthEnd } = getCycleDateRange(targetMonth.slice(0, 7));

  const results: TargetWithProgress[] = [];

  for (const target of targets) {
    let currentAmount = 0;

    if (target.category_id) {
      const txType = target.target_type === 'spending_limit' ? 'expense' : 'expense';

      const { data: txns } = await supabase
        .from('transactions')
        .select('amount, paid_amount, status')
        .eq('user_id', user.id)
        .eq('category_id', target.category_id)
        .eq('type', txType)
        .eq('bucket', target.bucket)
        .gte('date', monthStart)
        .lt('date', monthEnd)
        .in('status', ['paid', 'partial']);

      currentAmount = (txns || []).reduce((sum, tx) => {
        return sum + (tx.status === 'partial' ? (tx.paid_amount ?? 0) : tx.amount);
      }, 0);
    }

    let status: TargetStatus;
    let remaining = target.target_amount - currentAmount;

    if (target.target_type === 'spending_limit') {
      // Spending limit: we DON'T want to exceed
      if (currentAmount <= target.target_amount) {
        status = 'on_track';
      } else {
        status = 'exceeded';
        remaining = currentAmount - target.target_amount; // overspend amount
      }
    } else {
      // Required payment: we WANT to reach the target
      if (currentAmount >= target.target_amount) {
        status = 'completed';
        remaining = currentAmount - target.target_amount; // overpaid
      } else {
        status = 'underpaid';
        remaining = target.target_amount - currentAmount;
      }
    }

    const percentage = target.target_amount > 0
      ? Math.round((currentAmount / target.target_amount) * 100)
      : 0;

    results.push({
      ...target,
      current_amount: currentAmount,
      remaining,
      status,
      percentage,
    });
  }

  return results;
}

export async function createTarget(data: {
  month: string;
  category_id?: string | null;
  name: string;
  target_type: string;
  target_amount: number;
  bucket: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مسجل دخول');

  const { error } = await supabase.from('monthly_targets').insert({
    user_id: user.id,
    month: data.month,
    category_id: data.category_id || null,
    name: data.name,
    target_type: data.target_type,
    target_amount: data.target_amount,
    bucket: data.bucket,
    notes: data.notes || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/targets');
  revalidatePath('/');
}

export async function deleteTarget(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('monthly_targets').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/targets');
  revalidatePath('/');
}
