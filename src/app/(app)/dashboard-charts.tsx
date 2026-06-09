'use client';

import { IncomeExpenseChart, CategoryDonut, CashflowLine } from '@/components/dashboard/charts';
import type { CategoryBreakdown } from '@/types/database';

export default function DashboardCharts({ expenseBreakdown }: { expenseBreakdown: CategoryBreakdown[] }) {
  // Demo monthly data — will be dynamic when transactions exist
  const monthlyData = [
    { month: 'يناير', income: 0, expenses: 0 },
    { month: 'فبراير', income: 0, expenses: 0 },
    { month: 'مارس', income: 0, expenses: 0 },
  ];

  const dailyData = [
    { date: '1', income: 0, expenses: 0, net: 0 },
  ];

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>📊 الدخل مقابل المصروفات</h3>
        {monthlyData.some((d) => d.income > 0 || d.expenses > 0) ? (
          <IncomeExpenseChart data={monthlyData} />
        ) : (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-state-icon">📊</div>
            <p style={{ fontSize: 13 }}>أضف معاملات لعرض الرسم البياني</p>
          </div>
        )}
      </div>

      <div className="chart-card">
        <h3>🍩 المصروفات حسب الفئة</h3>
        {expenseBreakdown.length > 0 ? (
          <CategoryDonut data={expenseBreakdown} />
        ) : (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-state-icon">🍩</div>
            <p style={{ fontSize: 13 }}>أضف مصروفات لعرض التوزيع</p>
          </div>
        )}
      </div>

      <div className="chart-card" style={{ gridColumn: 'span 2' }}>
        <h3>📈 التدفق النقدي اليومي</h3>
        {dailyData.some((d) => d.income > 0 || d.expenses > 0) ? (
          <CashflowLine data={dailyData} />
        ) : (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-state-icon">📈</div>
            <p style={{ fontSize: 13 }}>أضف معاملات يومية لتتبع التدفق النقدي</p>
          </div>
        )}
      </div>
    </div>
  );
}
