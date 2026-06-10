'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CommitmentWithStatus } from '@/types/database';
import { getCycleMonth, getCycleDateRange } from '@/lib/utils';

export async function getCommitmentsWithStatus(simDateStr?: string): Promise<CommitmentWithStatus[]> {
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

  const today = simDateStr ? new Date(simDateStr) : new Date();
  const currentCycle = getCycleMonth(today);
  const { start: cycleStart, end: monthEndRaw } = getCycleDateRange(currentCycle);

  const endDate = new Date(monthEndRaw);
  endDate.setDate(endDate.getDate() - 1);
  const monthEnd = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  const currentDay = today.getDate();
  const cycleStartDate = new Date(cycleStart);

  const results: CommitmentWithStatus[] = [];

  for (const commitment of commitments) {
    let txns: any[] = [];

    // Fetch transactions containing the specific commitment id in notes (very precise)
    const { data: noteTxns } = await supabase
      .from('transactions')
      .select('id, amount, paid_amount, status, notes')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .eq('bucket', commitment.bucket)
      .gte('date', cycleStart)
      .lte('date', monthEnd)
      .like('notes', `%[commitment_id: ${commitment.id}]%`)
      .in('status', ['paid', 'partial']);

    if (noteTxns) {
      txns = [...noteTxns];
    }

    // Also fetch transactions matching by category if category is present and not already fetched
    if (commitment.category_id) {
      const { data: catTxns } = await supabase
        .from('transactions')
        .select('id, amount, paid_amount, status, notes')
        .eq('user_id', user.id)
        .eq('category_id', commitment.category_id)
        .eq('type', 'expense')
        .eq('bucket', commitment.bucket)
        .gte('date', cycleStart)
        .lte('date', monthEnd)
        .in('status', ['paid', 'partial']);

      if (catTxns) {
        catTxns.forEach((ct) => {
          if (!txns.some((t) => t.id === ct.id)) {
            txns.push(ct);
          }
        });
      }
    }

    const paidAmount = txns.reduce((sum, tx) => {
      return sum + (tx.status === 'partial' ? (tx.paid_amount ?? 0) : tx.amount);
    }, 0);

    // Check if the commitment was created after the current cycle started
    const createdDate = new Date(commitment.created_at);
    const isNewThisCycle = createdDate.getTime() > cycleStartDate.getTime();

    let status: CommitmentWithStatus['status'];
    if (isNewThisCycle) {
      status = 'pending';
    } else if (paidAmount >= commitment.amount) {
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

export async function payCommitment(commitmentId: string, simDateStr?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مسجل دخول');

  // 1. Get commitment details
  const { data: commitment, error: cErr } = await supabase
    .from('monthly_commitments')
    .select('*')
    .eq('id', commitmentId)
    .single();

  if (cErr || !commitment) throw new Error('الالتزام غير موجود');

  // 2. Get default bank account
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'bank')
    .limit(1);

  const bankAccountId = accounts?.[0]?.id;
  if (!bankAccountId) throw new Error('لم يتم العثور على حساب البنك للدفع منه');

  // 3. Create expense transaction
  const date = simDateStr || new Date().toISOString().split('T')[0];
  const { error: txErr } = await supabase.from('transactions').insert({
    user_id: user.id,
    account_id: bankAccountId,
    type: 'expense',
    bucket: commitment.bucket,
    amount: commitment.amount,
    category_id: commitment.category_id,
    status: 'paid',
    date: date,
    notes: `دفع التزام: ${commitment.name} [commitment_id: ${commitment.id}]`,
  });

  if (txErr) throw new Error(txErr.message);

  revalidatePath('/');
  revalidatePath('/commitments');
  revalidatePath('/transactions');
}

export async function unpayCommitment(commitmentId: string, simDateStr?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مسجل دخول');

  const today = simDateStr ? new Date(simDateStr) : new Date();
  const currentCycle = getCycleMonth(today);
  const { start: cycleStart, end: monthEndRaw } = getCycleDateRange(currentCycle);

  const endDate = new Date(monthEndRaw);
  endDate.setDate(endDate.getDate() - 1);
  const monthEnd = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  // Find the transaction that was created for this commitment in the current cycle
  const { data: txns } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('date', cycleStart)
    .lte('date', monthEnd)
    .like('notes', `%[commitment_id: ${commitmentId}]%`)
    .limit(1);

  const txnId = txns?.[0]?.id;
  if (!txnId) throw new Error('لم يتم العثور على عملية دفع لهذا الالتزام في الدورة الحالية');

  const { error: delErr } = await supabase
    .from('transactions')
    .delete()
    .eq('id', txnId);

  if (delErr) throw new Error(delErr.message);

  revalidatePath('/');
  revalidatePath('/commitments');
  revalidatePath('/transactions');
}
