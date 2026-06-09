'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormData } from '@/lib/validations/schemas';
import { createTransaction } from '@/lib/actions/transactions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { AccountWithBalance, Category, Project, Person } from '@/types/database';
import { transactionTypeLabels } from '@/lib/utils';

interface Props {
  accounts: AccountWithBalance[];
  categories: Category[];
  projects: Project[];
  people: Person[];
}

export default function TransactionForm({ accounts, categories, projects, people }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      bucket: 'personal',
      status: 'paid',
      is_recurring: false,
      account_id: accounts[0]?.id || '',
    },
  });

  const watchType = watch('type');
  const watchBucket = watch('bucket');
  const watchStatus = watch('status');

  const filteredCategories = useMemo(() => {
    const catType = watchType === 'income' ? 'income' : 'expense';
    return categories.filter((c) => c.type === catType && c.bucket === watchBucket);
  }, [watchType, watchBucket, categories]);

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    try {
      await createTransaction({
        ...data,
        destination_account_id: data.destination_account_id || null,
        paid_amount: data.paid_amount || null,
        category_id: data.category_id || null,
        project_id: data.project_id || null,
        person_id: data.person_id || null,
        notes: data.notes || '',
        adjustment_reason: data.adjustment_reason || '',
      });
      toast.success('تم إضافة المعاملة بنجاح ✅');
      reset();
      router.push('/transactions');
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Type & Bucket */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">نوع المعاملة</label>
            <select {...register('type')} className="form-select">
              {Object.entries(transactionTypeLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">التصنيف</label>
            <select {...register('bucket')} className="form-select">
              <option value="personal">شخصي</option>
              <option value="digi_whale">Digi Whale</option>
            </select>
          </div>
        </div>

        {/* Date & Amount */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">التاريخ</label>
            <input {...register('date')} type="date" className="form-input" dir="ltr" />
            {errors.date && <div className="form-error">{errors.date.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">المبلغ (ج.م)</label>
            <input {...register('amount', { valueAsNumber: true })} type="number" step="0.01" className="form-input" dir="ltr" style={{ textAlign: 'left' }} />
            {errors.amount && <div className="form-error">{errors.amount.message}</div>}
          </div>
        </div>

        {/* Account */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">الحساب</label>
            <select {...register('account_id')} className="form-select">
              <option value="">اختر الحساب</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
            {errors.account_id && <div className="form-error">{errors.account_id.message}</div>}
          </div>

          {watchType === 'transfer' && (
            <div className="form-group">
              <label className="form-label">حساب الوجهة</label>
              <select {...register('destination_account_id')} className="form-select">
                <option value="">اختر حساب الوجهة</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
              {errors.destination_account_id && <div className="form-error">{errors.destination_account_id.message}</div>}
            </div>
          )}
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">الفئة</label>
          <select {...register('category_id')} className="form-select">
            <option value="">اختر الفئة</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">الحالة</label>
            <select {...register('status')} className="form-select">
              <option value="paid">مدفوع</option>
              <option value="pending">معلق</option>
              <option value="partial">جزئي</option>
            </select>
          </div>

          {watchStatus === 'partial' && (
            <div className="form-group">
              <label className="form-label">المبلغ المدفوع</label>
              <input {...register('paid_amount', { valueAsNumber: true })} type="number" step="0.01" className="form-input" dir="ltr" style={{ textAlign: 'left' }} />
            </div>
          )}
        </div>

        {/* Person */}
        {people.length > 0 && (
          <div className="form-group">
            <label className="form-label">الشخص (اختياري)</label>
            <select {...register('person_id')} className="form-select">
              <option value="">بدون</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.role || p.type})</option>
              ))}
            </select>
          </div>
        )}

        {/* Project */}
        {watchBucket === 'digi_whale' && projects.length > 0 && (
          <div className="form-group">
            <label className="form-label">المشروع (اختياري)</label>
            <select {...register('project_id')} className="form-select">
              <option value="">بدون</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Adjustment reason */}
        {watchType === 'adjustment' && (
          <div className="form-group">
            <label className="form-label">سبب التسوية</label>
            <input {...register('adjustment_reason')} className="form-input" placeholder="اذكر السبب" />
            {errors.adjustment_reason && <div className="form-error">{errors.adjustment_reason.message}</div>}
          </div>
        )}

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">ملاحظات (اختياري)</label>
          <textarea {...register('notes')} className="form-textarea" rows={2} />
        </div>

        {/* Recurring */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input {...register('is_recurring')} type="checkbox" id="recurring" />
          <label htmlFor="recurring" style={{ fontSize: 13, cursor: 'pointer' }}>معاملة متكررة</label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: 12, marginTop: 8 }}>
          {loading ? 'جاري الحفظ...' : '✅ حفظ المعاملة'}
        </button>
      </form>
    </div>
  );
}
