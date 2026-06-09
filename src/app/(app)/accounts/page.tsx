import Header from '@/components/layout/header';
import { getAccounts } from '@/lib/actions/accounts';
import { formatCurrency } from '@/lib/utils';
import { AddAccountButton, AccountCard } from './account-actions';

export default async function AccountsPage() {
  const accounts = await getAccounts();
  const totalBalance = accounts.reduce((s, a) => s + a.current_balance, 0);

  return (
    <>
      <Header title="الحسابات" subtitle={`إجمالي الرصيد: ${formatCurrency(totalBalance)}`} />
      <AddAccountButton />

      {accounts.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon">🏦</div>
          <h3>لا توجد حسابات</h3>
          <p>أضف أول حساب لبدء تتبع أموالك</p>
        </div>
      ) : (
        <div className="stats-grid" style={{ marginTop: 20 }}>
          {accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </div>
      )}
    </>
  );
}
