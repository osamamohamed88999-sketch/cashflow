'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProjectWithTransactions } from '@/lib/actions/projects';

export default function AddProjectModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [collectedRevenue, setCollectedRevenue] = useState('');
  const [projectExpenses, setProjectExpenses] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('يرجى إدخال اسم المشروع');
      return;
    }

    const rev = parseFloat(collectedRevenue) || 0;
    const exp = parseFloat(projectExpenses) || 0;

    if (rev < 0 || exp < 0) {
      setError('المبالغ يجب أن تكون موجبة');
      return;
    }

    startTransition(async () => {
      try {
        await createProjectWithTransactions({
          name: name.trim(),
          client_name: clientName.trim() || undefined,
          collected_revenue: rev,
          project_expenses: exp,
        });
        
        // Reset states and close modal
        setName('');
        setClientName('');
        setCollectedRevenue('');
        setProjectExpenses('');
        setIsOpen(false);
        router.refresh();
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء إضافة المشروع');
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        ➕ إضافة مشروع ديجي ويل جديد
      </button>

      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            direction: 'rtl',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div 
            style={{
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 16,
              width: '100%',
              maxWidth: '500px',
              padding: 24,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                ➕ إضافة مشروع ديجي ويل جديد مع الأرباح والمصاريف
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label">اسم المشروع <span style={{ color: 'var(--color-expense)' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="مثال: متجر الكتروني WhatsApp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>

              <div>
                <label className="form-label">اسم العميل</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="مثال: شركة الهدى للملابس"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">المبلغ المحصل (إيراد) 💰</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="مثال: 12000"
                    value={collectedRevenue}
                    onChange={(e) => setCollectedRevenue(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="form-label">تكلفة الفريلانسرز (مصروف) 💸</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="مثال: 4000"
                    value={projectExpenses}
                    onChange={(e) => setProjectExpenses(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              {error && (
                <div className="form-error" style={{ fontSize: 13, padding: '8px 12px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isPending}
                >
                  {isPending ? 'جاري الإضافة...' : 'حفظ المشروع والمعاملات 💾'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
