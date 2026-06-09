'use client';

import { useState } from 'react';

interface ConfirmDeleteProps {
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDelete({ title = 'تأكيد الحذف', message = 'هل أنت متأكد من الحذف؟ لا يمكن التراجع.', onConfirm, onCancel }: ConfirmDeleteProps) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>{message}</p>
        <div className="modal-footer">
          <button className="btn btn-danger" onClick={onConfirm}>حذف</button>
          <button className="btn btn-secondary" onClick={onCancel}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

export function useConfirmDelete() {
  const [pending, setPending] = useState<(() => void) | null>(null);

  const requestDelete = (callback: () => void) => {
    setPending(() => callback);
  };

  const confirm = () => {
    if (pending) {
      pending();
      setPending(null);
    }
  };

  const cancel = () => {
    setPending(null);
  };

  return { isOpen: pending !== null, requestDelete, confirm, cancel };
}
