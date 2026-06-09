import Header from '@/components/layout/header';
import { getTransactions, getMonthlyTotals } from '@/lib/actions/transactions';
import { getAccounts } from '@/lib/actions/accounts';
import { getCategoryBreakdown } from '@/lib/actions/dashboard';
import { getCommitmentsWithStatus } from '@/lib/actions/commitments';
import { formatCurrency } from '@/lib/utils';
import ReportClient from './report-client';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; bucket?: string }>;
}) {
  const params = await searchParams;
  const month = params.month || new Date().toISOString().slice(0, 7);
  const bucket = params.bucket || undefined;

  const [transactions, totals, accounts, expenseBreakdown, commitments] = await Promise.all([
    getTransactions({ month, bucket }),
    getMonthlyTotals(month, bucket),
    getAccounts(),
    getCategoryBreakdown(month, 'expense', bucket),
    getCommitmentsWithStatus(),
  ]);

  const totalBalance = accounts.reduce((s, a) => s + a.current_balance, 0);
  const paidCommitments = commitments.filter((c) => c.status === 'paid');
  const unpaidCommitments = commitments.filter((c) => c.status !== 'paid');

  return (
    <>
      <Header title="التقارير" subtitle={`تقرير شهر ${month}`} />

      <ReportClient
        transactions={transactions}
        month={month}
        bucket={bucket}
      />

      {/* Report Summary */}
      <div className="stats-grid" style={{ marginTop: 20 }}>
        <div className="stat-card" style={{ '--stat-accent': 'var(--color-brand)' } as React.CSSProperties}>
          <div className="stat-card-label">إجمالي الرصيد</div>
          <div className="stat-card-value">{formatCurrency(totalBalance)}</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': 'var(--color-income)' } as React.CSSProperties}>
          <div className="stat-card-label">إجمالي الدخل</div>
          <div className="stat-card-value">{formatCurrency(totals.income)}</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': 'var(--color-expense)' } as React.CSSProperties}>
          <div className="stat-card-label">إجمالي المصروفات</div>
          <div className="stat-card-value">{formatCurrency(totals.expenses)}</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': totals.net >= 0 ? 'var(--color-income)' : 'var(--color-expense)' } as React.CSSProperties}>
          <div className="stat-card-label">صافي التدفق</div>
          <div className="stat-card-value" style={{ color: totals.net >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
            {formatCurrency(totals.net)}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {expenseBreakdown.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-heading)' }}>
            📊 توزيع المصروفات حسب الفئة
          </h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الفئة</th>
                  <th>المبلغ</th>
                  <th>النسبة</th>
                </tr>
              </thead>
              <tbody>
                {expenseBreakdown.map((cat, i) => (
                  <tr key={i}>
                    <td>{cat.icon} {cat.name}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(cat.amount)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar-wrap" style={{ width: 80, height: 6 }}>
                          <div className="progress-bar-fill" style={{ width: `${cat.percentage}%`, background: 'var(--color-brand)' }} />
                        </div>
                        <span style={{ fontSize: 12 }}>{cat.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commitment Summary */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-heading)' }}>
          📅 حالة الالتزامات
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>✅ مدفوعة ({paidCommitments.length})</div>
            {paidCommitments.map((c) => (
              <div key={c.id} style={{ fontSize: 14, marginBottom: 4 }}>
                {c.name} — {formatCurrency(c.amount)}
              </div>
            ))}
            {paidCommitments.length === 0 && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>لا يوجد</div>}
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>⏳ غير مدفوعة ({unpaidCommitments.length})</div>
            {unpaidCommitments.map((c) => (
              <div key={c.id} style={{ fontSize: 14, marginBottom: 4, color: 'var(--color-warning)' }}>
                {c.name} — باقي {formatCurrency(c.remaining)}
              </div>
            ))}
            {unpaidCommitments.length === 0 && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>لا يوجد</div>}
          </div>
        </div>
      </div>
    </>
  );
}
