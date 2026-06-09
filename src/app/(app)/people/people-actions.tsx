'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personSchema, type PersonFormData } from '@/lib/validations/schemas';
import { createPerson, updatePerson, deletePerson } from '@/lib/actions/people';
import { toast } from 'sonner';
import type { Person } from '@/types/database';
import { formatCurrency } from '@/lib/utils';
import { ConfirmDelete, useConfirmDelete } from '@/components/ui/confirm-delete';

export function AddPersonButton() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: { type: 'employee', is_active: true },
  });

  const onSubmit = async (data: PersonFormData) => {
    setLoading(true);
    try {
      await createPerson(data);
      toast.success('تم الإضافة بنجاح');
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setShowForm(true)}>➕ إضافة شخص</button>
      {showForm && (
        <PersonFormModal
          title="إضافة شخص"
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

export function PersonCard({ person }: { person: Person }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isOpen, requestDelete, confirm, cancel } = useConfirmDelete();

  const typeLabels: Record<string, string> = {
    employee: '👔 موظف', freelancer: '👨‍💻 فريلانسر', sales: '📊 مبيعات',
  };

  const { register, handleSubmit, formState: { errors } } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: person.name,
      type: person.type as any,
      role: person.role || '',
      monthly_salary: person.monthly_salary,
      per_project_rate: person.per_project_rate,
      phone: person.phone || '',
      email: person.email || '',
      notes: person.notes || '',
      is_active: person.is_active,
    },
  });

  const onSubmit = async (data: PersonFormData) => {
    setLoading(true);
    try {
      await updatePerson(person.id, data);
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
        await deletePerson(person.id);
        toast.success('تم الحذف');
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{person.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {typeLabels[person.type]} {person.role ? `· ${person.role}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span className={`badge ${person.is_active ? 'badge-income' : 'badge-expense'}`}>
              {person.is_active ? 'نشط' : 'غير نشط'}
            </span>
            <button className="btn-icon" onClick={() => setEditing(true)} title="تعديل">✏️</button>
            <button className="btn-icon" onClick={handleDelete} title="حذف">🗑️</button>
          </div>
        </div>

        {person.monthly_salary && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>الراتب الشهري</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-brand-light)' }}>
              {formatCurrency(person.monthly_salary)}
            </div>
          </div>
        )}

        {person.per_project_rate && (
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            سعر المشروع: {formatCurrency(person.per_project_rate)}
          </div>
        )}

        {person.phone && <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 6 }}>📱 {person.phone}</div>}
        {person.email && <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>📧 {person.email}</div>}
        {person.notes && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>{person.notes}</div>}
      </div>

      {editing && (
        <PersonFormModal
          title={`تعديل: ${person.name}`}
          onClose={() => setEditing(false)}
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          loading={loading}
        />
      )}

      {isOpen && <ConfirmDelete title="حذف الشخص" message={`هل أنت متأكد من حذف "${person.name}"؟`} onConfirm={confirm} onCancel={cancel} />}
    </>
  );
}

function PersonFormModal({ title, onClose, onSubmit, register, errors, loading }: {
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
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">الاسم</label>
              <input {...register('name')} className="form-input" />
              {errors.name && <div className="form-error">{errors.name.message}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">النوع</label>
              <select {...register('type')} className="form-select">
                <option value="employee">موظف</option>
                <option value="freelancer">فريلانسر</option>
                <option value="sales">مبيعات</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">المسمى الوظيفي</label>
            <input {...register('role')} className="form-input" placeholder="مثال: مسؤولة مبيعات" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">الراتب الشهري (ج.م)</label>
              <input {...register('monthly_salary', { valueAsNumber: true })} type="number" className="form-input" dir="ltr" style={{ textAlign: 'left' }} />
            </div>
            <div className="form-group">
              <label className="form-label">سعر المشروع (ج.م)</label>
              <input {...register('per_project_rate', { valueAsNumber: true })} type="number" className="form-input" dir="ltr" style={{ textAlign: 'left' }} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">الهاتف</label>
              <input {...register('phone')} className="form-input" dir="ltr" />
            </div>
            <div className="form-group">
              <label className="form-label">البريد</label>
              <input {...register('email')} type="email" className="form-input" dir="ltr" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">ملاحظات</label>
            <textarea {...register('notes')} className="form-textarea" rows={2} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input {...register('is_active')} type="checkbox" id="personActive" />
            <label htmlFor="personActive" style={{ fontSize: 13, cursor: 'pointer' }}>نشط حالياً</label>
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
