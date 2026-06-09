'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectFormData } from '@/lib/validations/schemas';
import { createProject, updateProject, deleteProject } from '@/lib/actions/projects';
import { toast } from 'sonner';
import type { Project } from '@/types/database';
import { ConfirmDelete, useConfirmDelete } from '@/components/ui/confirm-delete';

export function AddProjectButton() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: 'lead', expected_revenue: 0 },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      await createProject(data);
      toast.success('تم إضافة المشروع بنجاح');
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setShowForm(true)}>➕ مشروع جديد</button>
      {showForm && (
        <ProjectFormModal
          title="مشروع جديد"
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

export function ProjectRow({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isOpen, requestDelete, confirm, cancel } = useConfirmDelete();

  const statusLabels: Record<string, string> = {
    lead: 'فرصة', active: 'نشط', completed: 'مكتمل', cancelled: 'ملغي',
  };
  const statusColors: Record<string, string> = {
    lead: 'badge-warning', active: 'badge-income', completed: 'badge-brand', cancelled: 'badge-expense',
  };

  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      client_name: project.client_name || '',
      status: project.status as any,
      expected_revenue: project.expected_revenue,
      notes: project.notes || '',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      await updateProject(project.id, {
        name: data.name,
        client_name: data.client_name || '',
        status: data.status,
        expected_revenue: data.expected_revenue,
        notes: data.notes,
      });
      toast.success('تم تحديث المشروع ✅');
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleDelete = () => {
    requestDelete(async () => {
      try {
        await deleteProject(project.id);
        toast.success('تم حذف المشروع');
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const net = project.collected_revenue - project.project_expenses;

  return (
    <>
      <tr>
        <td style={{ fontWeight: 600 }}>{project.name}</td>
        <td>{project.client_name || '—'}</td>
        <td>
          <span className={`badge ${statusColors[project.status]}`}>
            {statusLabels[project.status]}
          </span>
        </td>
        <td>{project.expected_revenue.toLocaleString('ar-EG')} ج.م</td>
        <td style={{ color: 'var(--color-income)' }}>{project.collected_revenue.toLocaleString('ar-EG')} ج.م</td>
        <td style={{ color: 'var(--color-expense)' }}>{project.project_expenses.toLocaleString('ar-EG')} ج.م</td>
        <td style={{ fontWeight: 700, color: net >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
          {net.toLocaleString('ar-EG')} ج.م
        </td>
        <td>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn-icon" onClick={() => setEditing(true)} title="تعديل">✏️</button>
            <button className="btn-icon" onClick={handleDelete} title="حذف">🗑️</button>
          </div>
        </td>
      </tr>

      {editing && (
        <ProjectFormModal
          title={`تعديل: ${project.name}`}
          onClose={() => setEditing(false)}
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          loading={loading}
        />
      )}

      {isOpen && <ConfirmDelete title="حذف المشروع" message={`هل أنت متأكد من حذف "${project.name}"؟`} onConfirm={confirm} onCancel={cancel} />}
    </>
  );
}

function ProjectFormModal({ title, onClose, onSubmit, register, errors, loading }: {
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
            <label className="form-label">اسم المشروع</label>
            <input {...register('name')} className="form-input" />
            {errors.name && <div className="form-error">{errors.name.message}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">اسم العميل</label>
              <input {...register('client_name')} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">الحالة</label>
              <select {...register('status')} className="form-select">
                <option value="lead">فرصة</option>
                <option value="active">نشط</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">الإيراد المتوقع (ج.م)</label>
            <input {...register('expected_revenue', { valueAsNumber: true })} type="number" className="form-input" dir="ltr" style={{ textAlign: 'left' }} />
          </div>
          <div className="form-group">
            <label className="form-label">ملاحظات</label>
            <textarea {...register('notes')} className="form-textarea" rows={2} />
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
