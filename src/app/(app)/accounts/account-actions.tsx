'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema, type AccountFormData } from '@/lib/validations/schemas';
import { createAccount, updateAccount, deleteAccount } from '@/lib/actions/accounts';
import { toast } from 'sonner';
import { accountTypeLabels } from '@/lib/utils';
import type { AccountWithBalance } from '@/types/database';
import { ConfirmDelete, useConfirmDelete } from '@/components/ui/confirm-delete';

export function AddAccountButton() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { type: 'bank', opening_balance: 0 },
  });

  const onSubmit = async (data: AccountFormData) => {
    setLoading(true);
    try {
      await createAccount(data);
      toast.success('تم إضافة الحساب بنجاح');
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setShowForm(true)}>
        ➕ إضافة حساب جديد
      </button>

      {showForm && (
        <AccountFormModal
          title="إضافة حساب جديد"
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          loading={loading}
          showBalance={true}
        />
      )}
    </>
  );
}

export function AccountCard({ account }: { account: AccountWithBalance }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isOpen, requestDelete, confirm, cancel } = useConfirmDelete();

  const { register, handleSubmit, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account.name,
      type: account.type as any,
      opening_balance: account.opening_balance,
      notes: account.notes || '',
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    setLoading(true);
    try {
      await updateAccount(account.id, {
        name: data.name,
        type: data.type,
        notes: data.notes,
      });
      toast.success('تم تحديث الحساب ✅');
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleDelete = () => {
    requestDelete(async () => {
      try {
        await deleteAccount(account.id);
        toast.success('تم حذف الحساب');
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <>
      <div className="stat-card" style={{
        '--stat-accent': account.type === 'bank' ? 'var(--color-brand)' :
          account.type === 'business' ? '#8b5cf6' :
          account.type === 'wallet' ? '#f59e0b' : 'var(--color-income)',
      } as React.CSSProperties}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="stat-card-label">{accountTypeLabels[account.type]}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-heading)', marginBottom: 8 }}>
              {account.name}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-icon" onClick={() => setEditing(true)} title="تعديل">✏️</button>
            <button className="btn-icon" onClick={handleDelete} title="حذف">🗑️</button>
          </div>
        </div>

        <div className="stat-card-value">
          {account.current_balance.toLocaleString('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 12 }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>الافتتاحي: </span>
            <span>{account.opening_balance.toLocaleString('ar-EG')} ج.م</span>
          </div>
        </div>

        {account.balance_change !== 0 && (
          <span className={`stat-card-change ${account.balance_change >= 0 ? 'positive' : 'negative'}`}>
            {account.balance_change >= 0 ? '+' : ''}{account.balance_change_pct.toFixed(1)}% ({account.balance_change.toLocaleString('ar-EG')} ج.م)
          </span>
        )}

        {account.notes && (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            {account.notes}
          </div>
        )}
      </div>

      {editing && (
        <AccountFormModal
          title={`تعديل: ${account.name}`}
          onClose={() => setEditing(false)}
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          loading={loading}
          showBalance={false}
        />
      )}

      {isOpen && <ConfirmDelete title="حذف الحساب" message={`هل أنت متأكد من حذف "${account.name}"؟ سيتم حذف الحساب فقط وليس المعاملات المرتبطة.`} onConfirm={confirm} onCancel={cancel} />}
    </>
  );
}

function AccountFormModal({ title, onClose, onSubmit, register, errors, loading, showBalance }: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  register: any;
  errors: any;
  loading: boolean;
  showBalance: boolean;
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
            <label className="form-label">اسم الحساب</label>
            <input {...register('name')} className="form-input" placeholder="مثال: الحساب البنكي الشخصي" />
            {errors.name && <div className="form-error">{errors.name.message}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">نوع الحساب</label>
              <select {...register('type')} className="form-select">
                {Object.entries(accountTypeLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            {showBalance && (
              <div className="form-group">
                <label className="form-label">الرصيد الافتتاحي</label>
                <input {...register('opening_balance', { valueAsNumber: true })} type="number" step="0.01" className="form-input" dir="ltr" style={{ textAlign: 'left' }} />
                {errors.opening_balance && <div className="form-error">{errors.opening_balance.message}</div>}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">ملاحظات (اختياري)</label>
            <textarea {...register('notes')} className="form-textarea" rows={2} />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
