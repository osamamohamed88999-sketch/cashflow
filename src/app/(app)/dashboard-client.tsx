'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { updateBankBalance } from '@/lib/actions/accounts';
import { createCommitment, deleteCommitment } from '@/lib/actions/commitments';
import type { DashboardStats, CommitmentWithStatus } from '@/types/database';

interface DashboardClientProps {
  stats: DashboardStats;
  commitments: CommitmentWithStatus[];
  currentMonthName: string;
}

export default function DashboardClient({ stats, commitments, currentMonthName }: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Balance editing state
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [newBalance, setNewBalance] = useState(stats.personalBankBalance.toString());
  const [balanceError, setBalanceError] = useState('');

  // New commitment state
  const [cName, setCName] = useState('');
  const [cAmount, setCAmount] = useState('');
  const [cError, setCError] = useState('');

  const handleUpdateBalance = (e: React.FormEvent) => {
    e.preventDefault();
    setBalanceError('');
    const amt = parseFloat(newBalance);
    if (isNaN(amt) || amt < 0) {
      setBalanceError('يرجى إدخال مبلغ صحيح وموجب');
      return;
    }

    startTransition(async () => {
      try {
        await updateBankBalance(amt);
        setIsEditingBalance(false);
        router.refresh();
      } catch (err: any) {
        setBalanceError(err.message || 'حدث خطأ أثناء تحديث الرصيد');
      }
    });
  };

  const handleAddCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    setCError('');
    if (!cName.trim()) {
      setCError('يرجى كتابة اسم الالتزام');
      return;
    }
    const amt = parseFloat(cAmount);
    if (isNaN(amt) || amt <= 0) {
      setCError('يرجى كتابة مبلغ صحيح أكبر من الصفر');
      return;
    }

    startTransition(async () => {
      try {
        await createCommitment({
          name: cName.trim(),
          amount: amt,
          due_day: 5,
          bucket: 'personal',
          commitment_type: 'fixed',
          is_active: true,
          auto_create: false,
        });
        setCName('');
        setCAmount('');
        router.refresh();
      } catch (err: any) {
        setCError(err.message || 'حدث خطأ أثناء إضافة الالتزام');
      }
    });
  };

  const handleDeleteCommitment = (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الالتزام؟')) return;

    startTransition(async () => {
      try {
        await deleteCommitment(id);
        router.refresh();
      } catch (err: any) {
        alert(err.message || 'حدث خطأ أثناء حذف الالتزام');
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, direction: 'rtl' }}>
      
      {/* 1. Main Dashboard Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '16px 20px',
          background: 'rgba(26, 31, 53, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-heading)', margin: 0 }}>
            لوحة كاش فلو الحساب المالي 🐋
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            دورة شهر {currentMonthName} (بدأت في 5 من الشهر الحالي)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span 
            className="badge" 
            style={{ 
              background: stats.deductionsApplied ? 'var(--color-income-muted)' : 'var(--color-warning-muted)', 
              color: stats.deductionsApplied ? 'var(--color-income)' : 'var(--color-warning)',
              fontSize: 13,
              fontWeight: 700,
              padding: '6px 12px'
            }}
          >
            {stats.deductionsApplied ? 'تم خصم الالتزامات تلقائياً (يوم 5) ✅' : 'الالتزامات معلقة حتى يوم 5 ف الشهر ⏳'}
          </span>
        </div>
      </div>

      {/* 2. Three Main KPI Cards */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 20 
        }}
      >
        {/* Card 1: Bank Balance (Editable) */}
        <div 
          className="card" 
          style={{ 
            position: 'relative', 
            background: 'linear-gradient(135deg, #1e293b, #0f172a)', 
            border: '1px solid rgba(6, 182, 212, 0.3)',
            boxShadow: '0 4px 20px rgba(6, 182, 212, 0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-brand-light)', fontWeight: 600 }}>🏦 رصيد البنك الحالي</span>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => {
                setIsEditingBalance(!isEditingBalance);
                setNewBalance(stats.personalBankBalance.toString());
                setBalanceError('');
              }}
              style={{ padding: '2px 8px', color: 'var(--color-brand-light)', border: '1px solid rgba(6, 182, 212, 0.2)' }}
            >
              {isEditingBalance ? 'إلغاء' : 'تعديل ✏️'}
            </button>
          </div>

          {!isEditingBalance ? (
            <div>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
                {formatCurrency(stats.personalBankBalance)}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                <span>بدأ بـ {formatCurrency(stats.bankCycleStartBalance)}</span>
                <span style={{ color: stats.bankCycleChange >= 0 ? 'var(--color-income)' : 'var(--color-expense)', fontWeight: 'bold' }}>
                  {stats.bankCycleChange >= 0 ? '+' : ''}{formatPercentage(stats.bankCycleChangePct)}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateBalance} style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  className="form-input"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  style={{ background: '#0f172a', border: '1px solid var(--color-brand)' }}
                  placeholder="الرصيد الجديد"
                  disabled={isPending}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
                  {isPending ? 'جاري...' : 'حفظ'}
                </button>
              </div>
              {balanceError && <div className="form-error">{balanceError}</div>}
            </form>
          )}
        </div>

        {/* Card 2: Total Income */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #111b21, #0c1317)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-income)', fontWeight: 600 }}>📈 إجمالي الدخل المضاف</span>
            <span style={{ fontSize: 18 }}>💰</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#ffffff' }}>
            {formatCurrency(stats.monthIncome)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 10 }}>
            الدخل التراكمي لدورة هذا الشهر
          </div>
        </div>

        {/* Card 3: Deductions */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #2a1b1b, #1a0f0f)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-expense)', fontWeight: 600 }}>📉 الاستقطاعات التلقائية</span>
            <span style={{ fontSize: 18 }}>💸</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#ffffff' }}>
            {formatCurrency(stats.commitmentsTotal)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 10 }}>
            إجمالي الالتزامات المطلوب خصمها
          </div>
        </div>
      </div>

      {/* 3. P&L Net remaining summary card */}
      <div 
        className="card" 
        style={{ 
          padding: 24, 
          background: 'rgba(26, 31, 53, 0.3)',
          borderRight: `4px solid ${stats.netProfitAfterDeductions >= 0 ? 'var(--color-income)' : 'var(--color-expense)'}`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-heading)', margin: 0 }}>
            ⚖️ صافي الدخل المتبقي بعد الالتزامات
          </h3>
          <span 
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              background: stats.netProfitAfterDeductions >= 0 ? 'var(--color-income-muted)' : 'var(--color-expense-muted)',
              color: stats.netProfitAfterDeductions >= 0 ? 'var(--color-income)' : 'var(--color-expense)'
            }}
          >
            {stats.netProfitAfterDeductions >= 0 ? 'كسبان 🎉' : 'خسران ⚠️'}
          </span>
        </div>

        <div style={{ fontSize: 32, fontWeight: 900, color: stats.netProfitAfterDeductions >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
          {stats.netProfitAfterDeductions >= 0 ? '+' : ''}{formatCurrency(stats.netProfitAfterDeductions)}
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8 }}>
          حاصل طرح جميع الالتزامات الشهرية من إجمالي الدخل المضاف.
        </p>
      </div>

      {/* 4. Active Commitments Management */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>📋</span> الالتزامات الشهرية النشطة
        </h3>
        
        {/* Table of active commitments */}
        <div className="table-wrap" style={{ border: 'none', background: 'transparent' }}>
          <table className="data-table" style={{ background: 'transparent' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '12px' }}>اسم الالتزام</th>
                <th style={{ padding: '12px' }}>المبلغ</th>
                <th style={{ padding: '12px' }}>الحالة الحالية</th>
                <th style={{ padding: '12px', width: '80px', textAlign: 'center' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {commitments.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>
                    لا يوجد التزامات مسجلة حالياً. أضف التزاماً جديداً بالأسفل.
                  </td>
                </tr>
              ) : (
                commitments.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-expense)' }}>{formatCurrency(c.amount)}</td>
                    <td>
                      <span 
                        style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          color: stats.deductionsApplied ? 'var(--color-income)' : 'var(--color-warning)' 
                        }}
                      >
                        {stats.deductionsApplied ? 'تم الخصم تلقائياً ✅' : 'بانتظار الخصم يوم 5 ⏳'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDeleteCommitment(c.id)}
                        className="btn-icon" 
                        style={{ color: 'var(--color-expense)', opacity: 0.8 }}
                        title="حذف"
                        disabled={isPending}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Inline Add commitment Form */}
        <form onSubmit={handleAddCommitment} style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.01)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--color-text-primary)' }}>
            ➕ إضافة التزام شهري جديد (مرتب، إيجار، جمعية، إلخ...)
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label className="form-label">اسم الالتزام</label>
              <input
                type="text"
                className="form-input"
                placeholder="مثال: إيجار الشقة، مرتب هدى..."
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div style={{ width: '150px' }}>
              <label className="form-label">المبلغ الشهري</label>
              <input
                type="number"
                className="form-input"
                placeholder="مثال: 5000"
                value={cAmount}
                onChange={(e) => setCAmount(e.target.value)}
                disabled={isPending}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isPending}
              style={{ height: '42px', padding: '0 24px' }}
            >
              {isPending ? 'جاري...' : 'إضافة الالتزام ➕'}
            </button>
          </div>
          {cError && <div className="form-error" style={{ marginTop: 8 }}>{cError}</div>}
        </form>
      </div>

      {/* 5. Smart Opinion Box */}
      <div 
        style={{
          background: 'rgba(6, 182, 212, 0.05)',
          border: '1px solid rgba(6, 182, 212, 0.15)',
          borderRadius: 16,
          padding: 20,
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: 24 }}>💡</span>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-brand-light)', marginBottom: 6 }}>
            رأيي المالي المباشر:
          </h4>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-primary)', margin: 0 }}>
            {stats.smartOpinion}
          </p>
        </div>
      </div>

    </div>
  );
}
