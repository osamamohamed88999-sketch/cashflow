'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commitmentSchema, type CommitmentFormData } from '@/lib/validations/schemas';
import { createCommitment, updateCommitment, deleteCommitment } from '@/lib/actions/commitments';
import { toast } from 'sonner';
import type { CommitmentWithStatus } from '@/types/database';
import { formatCurrency } from '@/lib/utils';
import { ConfirmDelete, useConfirmDelete } from '@/components/ui/confirm-delete';

export function AddCommitmentButton() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CommitmentFormData>({
    resolver: zodResolver(commitmentSchema),
    defaultValues: { due_day: 1, bucket: 'personal', commitment_type: 'fixed', is_active: true, auto_create: false },
  });

  const onSubmit = async (data: CommitmentFormData) => {
    setLoading(true);
    try {
      await createCommitment(data);
      toast.success('تم إضافة الالتزام بنجاح');
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setShowForm(true)}>➕ التزام جديد</button>
      {showForm && (
        <CommitmentFormModal
          title="التزام جديد"
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          loading={loading}
        />
      )}
    </>
  );
}

export function CommitmentCard({ commitment }: { commitment: CommitmentWithStatus }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isOpen, requestDelete, confirm, cancel } = useConfirmDelete();

  const statusConfig: Record<string, { label: string; color: string; badge: string }> = {
    paid: { label: '✅ مدفوع', color: 'var(--color-income)', badge: 'badge-income' },
    partial: { label: '⚡ جزئي', color: 'var(--color-warning)', badge: 'badge-warning' },
    overdue: { label: '⚠️ متأخر', color: 'var(--color-expense)', badge: 'badge-expense' },
    pending: { label: '⏳ قادم', color: 'var(--color-info)', badge: 'badge-info' },
  };

  const cfg = statusConfig[commitment.status] || statusConfig.pending;
  const pct = commitment.amount > 0 ? Math.min(((commitment.paid_amount || 0) / commitment.amount) * 100, 100) : 0;

  const { register, handleSubmit, formState: { errors } } = useForm<CommitmentFormData>({
    resolver: zodResolver(commitmentSchema),
    defaultValues: {
      name: commitment.name,
      amount: commitment.amount,
      due_day: commitment.due_day,
      bucket: commitment.bucket as any,
      commitment_type: commitment.commitment_type as any,
      is_active: commitment.is_active,
      auto_create: commitment.auto_create,
      notes: commitment.notes || '',
    },
  });

  const onSubmit = async (data: CommitmentFormData) => {
    setLoading(true);
    try {
      await updateCommitment(commitment.id, data);
      toast.success('تم التحديث ✅');
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleDelete = () => {
    requestDelete(async () => {
      try {
        await deleteCommitment(commitment.id);
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>{commitment.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              يوم {commitment.due_day} · {commitment.bucket === 'digi_whale' ? 'Digi Whale' : 'شخصي'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
            <button className="btn-icon" onClick={() => setEditing(true)} title="تعديل">✏️</button>
            <button className="btn-icon" onClick={handleDelete} title="حذف">🗑️</button>
          </div>
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, color: cfg.color }}>
          {formatCurrency(commitment.amount)}
        </div>

        <div className="progress-bar-wrap" style={{ marginTop: 10 }}>
          <div className="progress-bar-fill" style={{
            width: `${pct}%`,
            background: cfg.color,
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--color-text-muted)' }}>
          <span>المدفوع: {formatCurrency(commitment.paid_amount || 0)}</span>
          <span>المتبقي: {formatCurrency(commitment.remaining)}</span>
        </div>

        {commitment.notes && (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>{commitment.notes}</div>
        )}
      </div>

      {editing && (
        <CommitmentFormModal
          title={`تعديل: ${commitment.name}`}
          onClose={() => setEditing(false)}
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          loading={loading}
        />
      )}

      {isOpen && <ConfirmDelete title="حذف الالتزام" message={`هل أنت متأكد من حذف "${commitment.name}"؟`} onConfirm={confirm} onCancel={cancel} />}
    </>
  );
}

function CommitmentFormModal({ title, onClose, onSubmit, register, errors, loading }: {
  title: string; onClose: () => void; onSubmit: (e: React.FormEvent) => void;
  register: any; errors: any; loading: boolean;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">اسم الالتزام</label>
            <input {...register('name')} className="form-input" />
            {errors.name && <div className="form-error">{errors.name.message}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">المبلغ (ج.م)</label>
              <input {...register('amount', { valueAsNumber: true })} type="number" className="form-input" dir="ltr" style={{ textAlign: 'left' }} />
              {errors.amount && <div className="form-error">{errors.amount.message}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">يوم الاستحقاق</label>
              <input {...register('due_day', { valueAsNumber: true })} type="number" min={1} max={28} className="form-input" dir="ltr" />
              {errors.due_day && <div className="form-error">{errors.due_day.message}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">التصنيف</label>
              <select {...register('bucket')} className="form-select">
                <option value="personal">شخصي</option>
                <option value="digi_whale">Digi Whale</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">نوع الالتزام</label>
              <select {...register('commitment_type')} className="form-select">
                <option value="fixed">ثابت</option>
                <option value="temporary">مؤقت</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">ملاحظات</label>
            <textarea {...register('notes')} className="form-textarea" rows={2} />
          </div>
          <div className="form-group" style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input {...register('is_active')} type="checkbox" /> نشط
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input {...register('auto_create')} type="checkbox" /> إنشاء تلقائي
            </label>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'حفظ'}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
