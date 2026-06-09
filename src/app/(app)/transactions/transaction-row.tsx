'use client';

import { deleteTransaction } from '@/lib/actions/transactions';
import { formatCurrency, formatDate, transactionTypeLabels, statusLabels, bucketLabels } from '@/lib/utils';
import { toast } from 'sonner';
import type { TransactionWithRelations } from '@/types/database';
import { ConfirmDelete, useConfirmDelete } from '@/components/ui/confirm-delete';

const typeColors: Record<string, string> = {
  income: 'badge-income',
  expense: 'badge-expense',
  transfer: 'badge-info',
  adjustment: 'badge-warning',
};

export default function TransactionRow({ tx }: { tx: TransactionWithRelations }) {
  const { isOpen, requestDelete, confirm, cancel } = useConfirmDelete();

  const handleDelete = () => {
    requestDelete(async () => {
      try {
        await deleteTransaction(tx.id);
        toast.success('تم حذف المعاملة');
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <>
      <tr>
        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(tx.date)}</td>
        <td>
          <span className={`badge ${typeColors[tx.type]}`}>
            {transactionTypeLabels[tx.type]}
          </span>
        </td>
        <td>{tx.account?.name || '—'}</td>
        <td>
          {tx.category?.icon} {tx.category?.name || '—'}
        </td>
        <td style={{
          fontWeight: 700,
          color: tx.type === 'income' ? 'var(--color-income)' :
            tx.type === 'expense' ? 'var(--color-expense)' : 'var(--color-text-primary)',
        }}>
          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
          {formatCurrency(tx.amount)}
        </td>
        <td>
          <span className={`badge ${tx.bucket === 'digi_whale' ? 'badge-brand' : 'badge-info'}`}>
            {bucketLabels[tx.bucket]}
          </span>
        </td>
        <td>
          <span className={`badge ${tx.status === 'paid' ? 'badge-income' : tx.status === 'pending' ? 'badge-warning' : 'badge-info'}`}>
            {statusLabels[tx.status]}
          </span>
        </td>
        <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tx.notes || '—'}
        </td>
        <td>
          <button className="btn-icon" onClick={handleDelete} title="حذف">🗑️</button>
        </td>
      </tr>

      {isOpen && <ConfirmDelete title="حذف المعاملة" message={`هل أنت متأكد من حذف هذه المعاملة (${formatCurrency(tx.amount)})؟ سيؤثر ذلك على الأرصدة المحسوبة.`} onConfirm={confirm} onCancel={cancel} />}
    </>
  );
}
