import Header from '@/components/layout/header';
import { getTargetsWithProgress } from '@/lib/actions/targets';
import { AddTargetButton, TargetCard } from './target-actions';

export default async function TargetsPage() {
  const targets = await getTargetsWithProgress();

  return (
    <>
      <Header title="الأهداف الشهرية" subtitle="ميزانيات وحدود الإنفاق" />
      <AddTargetButton />

      {targets.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon">🎯</div>
          <h3>لا توجد أهداف</h3>
          <p>حدد أهداف إنفاق أو مدفوعات مطلوبة لهذا الشهر</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: 20 }}>
          {targets.map((t) => (
            <TargetCard key={t.id} target={t} />
          ))}
        </div>
      )}
    </>
  );
}
