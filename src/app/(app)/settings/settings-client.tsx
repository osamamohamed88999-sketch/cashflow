'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, type CategoryFormData } from '@/lib/validations/schemas';
import { createCategory, deleteCategory } from '@/lib/actions/categories';
import { toast } from 'sonner';
import type { Category } from '@/types/database';
import { ConfirmDelete, useConfirmDelete } from '@/components/ui/confirm-delete';

export default function SettingsClient({ categories }: { categories: Category[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isOpen, requestDelete, confirm, cancel } = useConfirmDelete();

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { type: 'expense', bucket: 'personal' },
  });

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      await createCategory(data);
      toast.success('تم إضافة الفئة');
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    requestDelete(async () => {
      try {
        await deleteCategory(id);
        toast.success('تم الحذف');
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setShowForm(true)}>➕ فئة جديدة</button>

      {/* Income Categories */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--color-income)' }}>📈 فئات الدخل</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {incomeCategories.map((cat) => (
            <div key={cat.id} className="badge badge-income" style={{ cursor: cat.is_default ? 'default' : 'pointer', padding: '8px 14px' }}>
              {cat.icon} {cat.name}
              {!cat.is_default && (
                <button
                  onClick={() => handleDelete(cat.id)}
                  style={{ marginRight: 8, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 12 }}
                >✕</button>
              )}
            </div>
          ))}
          {incomeCategories.length === 0 && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>لا توجد</div>}
        </div>
      </div>

      {/* Expense Categories */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--color-expense)' }}>📉 فئات المصروفات</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {expenseCategories.map((cat) => (
            <div key={cat.id} className="badge badge-expense" style={{ cursor: cat.is_default ? 'default' : 'pointer', padding: '8px 14px' }}>
              {cat.icon} {cat.name}
              {!cat.is_default && (
                <button
                  onClick={() => handleDelete(cat.id)}
                  style={{ marginRight: 8, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 12 }}
                >✕</button>
              )}
            </div>
          ))}
          {expenseCategories.length === 0 && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>لا توجد</div>}
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3>فئة جديدة</h3>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">اسم الفئة</label>
                <input {...register('name')} className="form-input" />
                {errors.name && <div className="form-error">{errors.name.message}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">النوع</label>
                  <select {...register('type')} className="form-select">
                    <option value="income">دخل</option>
                    <option value="expense">مصروف</option>
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
              <div className="form-group">
                <label className="form-label">أيقونة (اختياري)</label>
                <input {...register('icon')} className="form-input" placeholder="مثال: 🍔" />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'حفظ'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {isOpen && <ConfirmDelete onConfirm={confirm} onCancel={cancel} />}
    </>
  );
}
