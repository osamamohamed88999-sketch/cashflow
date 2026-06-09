import Header from '@/components/layout/header';
import { getTransactions } from '@/lib/actions/transactions';
import TransactionFilters from './transaction-filters';
import TransactionRow from './transaction-row';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; bucket?: string; type?: string }>;
}) {
  const params = await searchParams;
  const transactions = await getTransactions({
    month: params.month,
    bucket: params.bucket,
    type: params.type,
  });

  return (
    <>
      <Header title="المعاملات" subtitle={`${transactions.length} معاملة`} />

      <TransactionFilters />

      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>لا توجد معاملات</h3>
          <p>أضف معاملتك الأولى من صفحة &quot;إضافة معاملة&quot;</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>النوع</th>
                <th>الحساب</th>
                <th>الفئة</th>
                <th>المبلغ</th>
                <th>التصنيف</th>
                <th>الحالة</th>
                <th>ملاحظات</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
