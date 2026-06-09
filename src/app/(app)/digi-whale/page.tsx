import Header from '@/components/layout/header';
import { getMonthlyTotals } from '@/lib/actions/transactions';
import { getProjects } from '@/lib/actions/projects';
import { getPeople } from '@/lib/actions/people';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function DigiWhalePage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const totals = await getMonthlyTotals(currentMonth, 'digi_whale');
  const projects = await getProjects();
  const people = await getPeople();

  const activeProjects = projects.filter((p) => p.status === 'active');
  const totalProjectRevenue = projects.reduce((s, p) => s + p.collected_revenue, 0);
  const totalProjectExpenses = projects.reduce((s, p) => s + p.project_expenses, 0);

  return (
    <>
      <Header title="🐋 Digi Whale Business" subtitle="نظرة شاملة على أداء الشركة" />

      {/* Business Summary */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ '--stat-accent': '#8b5cf6' } as React.CSSProperties}>
          <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>💰</div>
          <div className="stat-card-label">دخل الشهر</div>
          <div className="stat-card-value">{formatCurrency(totals.income)}</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': '#ec4899' } as React.CSSProperties}>
          <div className="stat-card-icon" style={{ background: 'rgba(236,72,153,0.15)' }}>💸</div>
          <div className="stat-card-label">مصاريف الشهر</div>
          <div className="stat-card-value">{formatCurrency(totals.expenses)}</div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': totals.net >= 0 ? 'var(--color-income)' : 'var(--color-expense)' } as React.CSSProperties}>
          <div className="stat-card-icon" style={{ background: totals.net >= 0 ? 'var(--color-income-muted)' : 'var(--color-expense-muted)' }}>📊</div>
          <div className="stat-card-label">صافي الربح</div>
          <div className="stat-card-value" style={{ color: totals.net >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
            {formatCurrency(totals.net)}
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-accent': 'var(--color-brand)' } as React.CSSProperties}>
          <div className="stat-card-icon" style={{ background: 'var(--color-brand-muted)' }}>📁</div>
          <div className="stat-card-label">مشاريع نشطة</div>
          <div className="stat-card-value">{activeProjects.length}</div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Link href="/projects" className="btn btn-secondary">📁 المشاريع ({projects.length})</Link>
        <Link href="/people" className="btn btn-secondary">👥 الفريق ({people.length})</Link>
        <Link href="/transactions/add" className="btn btn-primary">➕ إضافة معاملة</Link>
      </div>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-heading)' }}>
            📁 المشاريع النشطة
          </h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>المشروع</th>
                  <th>العميل</th>
                  <th>الإيراد المتوقع</th>
                  <th>المحصل</th>
                  <th>المصاريف</th>
                  <th>صافي الربح</th>
                </tr>
              </thead>
              <tbody>
                {activeProjects.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.client_name || '—'}</td>
                    <td>{formatCurrency(p.expected_revenue)}</td>
                    <td style={{ color: 'var(--color-income)' }}>{formatCurrency(p.collected_revenue)}</td>
                    <td style={{ color: 'var(--color-expense)' }}>{formatCurrency(p.project_expenses)}</td>
                    <td style={{ fontWeight: 700, color: (p.collected_revenue - p.project_expenses) >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
                      {formatCurrency(p.collected_revenue - p.project_expenses)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Team */}
      {people.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-heading)' }}>
            👥 فريق العمل
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {people.map((p) => (
              <div key={p.id} className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {p.role || p.type}
                </div>
                {p.monthly_salary && (
                  <div style={{ fontSize: 14, color: 'var(--color-brand-light)', marginTop: 6 }}>
                    {formatCurrency(p.monthly_salary)}/شهر
                  </div>
                )}
                <span className={`badge ${p.is_active ? 'badge-income' : 'badge-expense'}`} style={{ marginTop: 6 }}>
                  {p.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
