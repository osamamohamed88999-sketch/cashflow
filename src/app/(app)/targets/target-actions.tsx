'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { targetSchema, type TargetFormData } from '@/lib/validations/schemas';
import { createTarget, deleteTarget } from '@/lib/actions/targets';
import { toast } from 'sonner';
import type { TargetWithProgress } from '@/types/database';
import { formatCurrency } from '@/lib/utils';
import { ConfirmDelete, useConfirmDelete } from '@/components/ui/confirm-delete';

export function AddTargetButton() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TargetFormData>({
    resolver: zodResolver(targetSchema),
    defaultValues: {
      month: new Date().toISOString().slice(0, 7),
      target_type: 'spending_limit',
      target_amount: 0,
      bucket: 'personal',
    },
  });

  const onSubmit = async (data: TargetFormData) => {
    setLoading(true);
    try {
      await createTarget(data);
      toast.success('تم إضافة الهدف بنجاح');
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setShowForm(true)}>➕ هدف جديد</button>
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>هدف جديد</h3>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">اسم الهدف</label>
                <input {...register('name')} className="form-input" />
                {errors.name && <div className="form-error">{errors.name.message}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">الشهر</label>
                  <input {...register('month')} type="month" className="form-input" dir="ltr" />
                </div>
                <div className="form-group">
                  <label className="form-label">نوع الهدف</label>
                  <select {...register('target_type')} className="form-select">
                    <option value="spending_limit">حد إنفاق</option>
                    <option value="required_payment">مدفوعات مطلوبة</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">المبلغ المستهدف (ج.م)</label>
                  <input {...register('target_amount', { valueAsNumber: true })} type="number" className="form-input" dir="ltr" style={{ textAlign: 'left' }} />
                  {errors.target_amount && <div className="form-error">{errors.target_amount.message}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">التصنيف</label>
                  <select {...register('bucket')} className="form-select">
                    <option value="personal">شخصي</option>
                    <option value="digi_whale">Digi Whale</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ملاحظات</label>
                <textarea {...register('notes')} className="form-textarea" rows={2} />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'حفظ'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function TargetCard({ target }: { target: TargetWithProgress }) {
  const { isOpen, requestDelete, confirm, cancel } = useConfirmDelete();

  const isLimit = target.target_type === 'spending_limit';
  const pct = target.percentage;
  const overBudget = isLimit && pct > 100;

  const barColor = overBudget ? 'var(--color-expense)' :
    pct >= 80 ? 'var(--color-warning)' : 'var(--color-income)';

  const statusMsg = isLimit
    ? (overBudget ? `⚠️ تجاوزت الحد بـ ${formatCurrency(target.current_amount - target.target_amount)}` : `✅ متبقي ${formatCurrency(target.target_amount - target.current_amount)}`)
    : (pct >= 100 ? '✅ تم تحقيق الهدف' : `⏳ متبقي ${formatCurrency(target.target_amount - target.current_amount)}`);

  const handleDelete = () => {
    requestDelete(async () => {
      try {
        await deleteTarget(target.id);
        toast.success('تم الحذف');
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{target.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {isLimit ? '📉 حد إنفاق' : '📈 مدفوعات مطلوبة'} · {target.bucket === 'digi_whale' ? 'Digi Whale' : 'شخصي'}
            </div>
          </div>
          <button className="btn-icon" onClick={handleDelete} title="حذف">🗑️</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
          <span>الفعلي: {formatCurrency(target.current_amount)}</span>
          <span>الهدف: {formatCurrency(target.target_amount)}</span>
        </div>

        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{
            width: `${Math.min(pct, 100)}%`,
            background: barColor,
          }} />
        </div>

        <div style={{ marginTop: 8, fontSize: 13 }}>{statusMsg}</div>

        {target.notes && (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>{target.notes}</div>
        )}
      </div>

      {isOpen && <ConfirmDelete title="حذف الهدف" message={`هل أنت متأكد من حذف "${target.name}"؟`} onConfirm={confirm} onCancel={cancel} />}
    </>
  );
}
