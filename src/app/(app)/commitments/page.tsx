import Header from '@/components/layout/header';
import { getCommitmentsWithStatus } from '@/lib/actions/commitments';
import { formatCurrency } from '@/lib/utils';
import { AddCommitmentButton, CommitmentCard } from './commitment-actions';

export default async function CommitmentsPage() {
  const commitments = await getCommitmentsWithStatus();

  const totalAmount = commitments.reduce((s, c) => s + c.amount, 0);
  const totalPaid = commitments.reduce((s, c) => s + (c.paid_amount || 0), 0);
  const totalRemaining = commitments.reduce((s, c) => s + c.remaining, 0);

  return (
    <>
      <Header title="الالتزامات الشهرية" subtitle="تتبع الفواتير والمصروفات الثابتة" />
      <AddCommitmentButton />

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginTop: 20 }}>
        <div className="stat-card" style={{ '--stat-accent': 'var(--color-brand)' } as React.CSSProperties}>
          <div className="stat-card-label">إجمالي الالتزامات</div>
          <div className="stat-card-value">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': 'var(--color-income)' } as React.CSSProperties}>
          <div className="stat-card-label">تم الدفع</div>
          <div className="stat-card-value" style={{ color: 'var(--color-income)' }}>{formatCurrency(totalPaid)}</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': 'var(--color-expense)' } as React.CSSProperties}>
          <div className="stat-card-label">متبقي</div>
          <div className="stat-card-value" style={{ color: 'var(--color-expense)' }}>{formatCurrency(totalRemaining)}</div>
        </div>
      </div>

      {/* Commitments List */}
      {commitments.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <div className="empty-state-icon">📅</div>
          <h3>لا توجد التزامات</h3>
          <p>أضف التزاماتك الشهرية مثل الإيجار والاشتراكات</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: 8 }}>
          {commitments.map((c) => (
            <CommitmentCard key={c.id} commitment={c} />
          ))}
        </div>
      )}
    </>
  );
}
