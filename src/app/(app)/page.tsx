import Header from '@/components/layout/header';
import { getDashboardStats, getCategoryBreakdown, getSmartInsights } from '@/lib/actions/dashboard';
import { getCommitmentsWithStatus } from '@/lib/actions/commitments';
import { getTargetsWithProgress } from '@/lib/actions/targets';
import { formatCurrency, formatPercentage, getCycleMonth } from '@/lib/utils';
import DashboardCharts from './dashboard-charts';

export default async function DashboardPage() {
  const currentMonth = getCycleMonth(new Date());

  // Fetch all dashboard data in parallel to maximize page load speed
  const [stats, commitments, targets, expenseBreakdown] = await Promise.all([
    getDashboardStats(),
    getCommitmentsWithStatus(),
    getTargetsWithProgress(),
    getCategoryBreakdown(currentMonth, 'expense'),
  ]);

  const insights = await getSmartInsights(stats);

  const statCards = [
    {
      label: 'إجمالي الرصيد',
      value: formatCurrency(stats.totalBalance),
      icon: '💰',
      accent: 'var(--color-brand)',
      bg: 'var(--color-brand-muted)',
    },
    {
      label: 'رصيد البنك',
      value: formatCurrency(stats.personalBankBalance),
      icon: '🏦',
      accent: 'var(--color-info)',
      bg: 'var(--color-info-muted)',
      change: stats.bankCycleChangePct,
      subtitle: `بدأ بـ ${formatCurrency(stats.bankCycleStartBalance)}`,
    },
    {
      label: 'دخل الشهر',
      value: formatCurrency(stats.monthIncome),
      icon: '📈',
      accent: 'var(--color-income)',
      bg: 'var(--color-income-muted)',
    },
    {
      label: 'مصروفات الشهر',
      value: formatCurrency(stats.monthExpenses),
      icon: '📉',
      accent: 'var(--color-expense)',
      bg: 'var(--color-expense-muted)',
    },
    {
      label: 'صافي الشهر',
      value: formatCurrency(stats.monthNet),
      icon: '💹',
      accent: stats.monthNet >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
      bg: stats.monthNet >= 0 ? 'var(--color-income-muted)' : 'var(--color-expense-muted)',
    },
    {
      label: 'دخل Digi Whale',
      value: formatCurrency(stats.digiWhaleIncome),
      icon: '🐋',
      accent: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.15)',
    },
    {
      label: 'مصروفات Digi Whale',
      value: formatCurrency(stats.digiWhaleExpenses),
      icon: '💼',
      accent: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.15)',
    },
    {
      label: 'صافي Digi Whale',
      value: formatCurrency(stats.digiWhaleNet),
      icon: '🚀',
      accent: stats.digiWhaleNet >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
      bg: stats.digiWhaleNet >= 0 ? 'var(--color-income-muted)' : 'var(--color-expense-muted)',
    },
    {
      label: 'التزامات متبقية',
      value: formatCurrency(stats.remainingCommitments),
      icon: '📅',
      accent: 'var(--color-warning)',
      bg: 'var(--color-warning-muted)',
    },
    {
      label: 'تغير المصروفات',
      value: formatPercentage(stats.spendingChangePct),
      icon: '📊',
      accent: stats.spendingChangePct > 0 ? 'var(--color-expense)' : 'var(--color-income)',
      bg: stats.spendingChangePct > 0 ? 'var(--color-expense-muted)' : 'var(--color-income-muted)',
    },
  ];

  return (
    <>
      <Header title="لوحة التحكم" subtitle="نظرة شاملة على وضعك المالي" />

      {/* Stat Cards Grid */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ '--stat-accent': card.accent } as React.CSSProperties}
          >
            <div className="stat-card-icon" style={{ background: card.bg }}>
              {card.icon}
            </div>
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value">{card.value}</div>
            {card.change !== undefined && (
              <span className={`stat-card-change ${card.change >= 0 ? 'positive' : 'negative'}`}>
                {formatPercentage(card.change)}
              </span>
            )}
            {card.subtitle && (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {card.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bank Balance Detail Card */}
      <div className="card" style={{ marginBottom: 24, borderRight: '4px solid var(--color-info)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-heading)' }}>
          🏦 تفاصيل رصيد البنك للدورة الحالية
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>بدأ بـ (يوم 10 في الشهر)</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(stats.bankCycleStartBalance)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>الرصيد الحالي</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(stats.personalBankBalance)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>الفرق (الدورة الحالية)</div>
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              color: stats.bankCycleChange >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
            }}>
              {stats.bankCycleChange >= 0 ? '+' : ''}{formatCurrency(stats.bankCycleChange)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>نسبة التغيير</div>
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              color: stats.bankCycleChangePct >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
            }}>
              {stats.bankCycleChangePct >= 0 ? '+' : ''}{formatPercentage(stats.bankCycleChangePct)}
            </div>
          </div>
        </div>
      </div>

      {/* P&L and Budget Summary Card */}
      <div className="card" style={{ marginBottom: 24, padding: 24, borderRight: '4px solid var(--color-brand)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚖️</span> ملخص الربح والخسارة للميزانية (الدورة الحالية)
          </h3>
          <span 
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 'bold',
              background: stats.monthNet >= 0 ? 'var(--color-income-muted)' : 'var(--color-expense-muted)',
              color: stats.monthNet >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {stats.monthNet >= 0 ? 'كسبان 🎉' : 'خسران ⚠️'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {/* Financial Health Status */}
          <div 
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              borderRadius: 12, 
              padding: 20, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>صافي ربح الدورة الحالية</span>
            <div 
              style={{ 
                fontSize: 28, 
                fontWeight: 800, 
                color: stats.monthNet >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
                marginBottom: 6
              }}
            >
              {stats.monthNet >= 0 ? '+' : ''}{formatCurrency(stats.monthNet)}
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {stats.monthNet >= 0 ? 'أداء ممتاز، الإيرادات تغطي المصروفات!' : 'تنبيه: المصروفات تجاوزت الإيرادات.'}
            </span>
          </div>

          {/* Target & Budget List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>الدخل الشهري المرجعي</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{formatCurrency(40000)}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>الفعلي: {formatCurrency(stats.monthIncome)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>مرتب هدى الثابت</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-expense)' }}>{formatCurrency(5000)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>ميزانية فريلانسرز (الفعلية)</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-expense)' }}>
                {formatCurrency(expenseBreakdown.find(c => c.name.includes('فريلانسر') || c.name.toLowerCase().includes('freelance') || c.name.includes('فري لانس'))?.amount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts expenseBreakdown={expenseBreakdown} />

      {/* Commitments Progress */}
      {commitments.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-heading)' }}>
            📅 الالتزامات الشهرية
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {commitments.map((c) => {
              const pct = c.amount > 0 ? Math.min(100, (c.paid_amount / c.amount) * 100) : 0;
              const statusColors: Record<string, string> = {
                paid: 'var(--color-income)',
                partial: 'var(--color-warning)',
                overdue: 'var(--color-expense)',
                pending: 'var(--color-text-muted)',
              };
              const statusLabels: Record<string, string> = {
                paid: 'مدفوع ✅',
                partial: 'جزئي',
                overdue: 'متأخر ⚠️',
                pending: 'معلق',
              };

              return (
                <div key={c.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span>{c.name}</span>
                    <span style={{ color: statusColors[c.status] }}>{statusLabels[c.status]} — {formatCurrency(c.paid_amount)} / {formatCurrency(c.amount)}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: statusColors[c.status],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Targets Progress */}
      {targets.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-heading)' }}>
            🎯 الأهداف والميزانية
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {targets.map((t) => {
              const pct = Math.min(100, t.percentage);
              let color = 'var(--color-brand)';
              let statusMsg = '';

              if (t.target_type === 'spending_limit') {
                if (t.status === 'exceeded') {
                  color = 'var(--color-expense)';
                  statusMsg = `تعديت بـ ${formatCurrency(t.remaining)} ⚠️`;
                } else {
                  color = 'var(--color-income)';
                  statusMsg = `باقي ${formatCurrency(t.remaining)}`;
                }
              } else {
                if (t.status === 'completed') {
                  color = 'var(--color-income)';
                  statusMsg = t.remaining > 0
                    ? `دفعت زيادة ${formatCurrency(t.remaining)} ✅`
                    : 'تمام، خلصت البند ✅';
                } else {
                  color = 'var(--color-warning)';
                  statusMsg = `باقي ${formatCurrency(t.remaining)}`;
                }
              }

              return (
                <div key={t.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span>{t.name}</span>
                    <span style={{ color }}>{statusMsg}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-heading)' }}>
            💡 رؤى ذكية
          </h3>
          <div className="insights-list">
            {insights.map((insight, i) => (
              <div key={i} className={`insight-item ${insight.type}`}>
                <span style={{ fontSize: 18 }}>{insight.icon}</span>
                <span>{insight.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
