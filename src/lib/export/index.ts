import type { TransactionWithRelations } from '@/types/database';
import { transactionTypeLabels, statusLabels, bucketLabels } from '@/lib/utils';

export function exportToCSV(transactions: TransactionWithRelations[], filename: string) {
  const headers = ['التاريخ', 'النوع', 'الحساب', 'المبلغ', 'الفئة', 'التصنيف', 'الحالة', 'ملاحظات'];

  const rows = transactions.map((tx) => [
    tx.date,
    transactionTypeLabels[tx.type] || tx.type,
    tx.account?.name || '',
    tx.amount.toString(),
    tx.category?.name || '',
    bucketLabels[tx.bucket] || tx.bucket,
    statusLabels[tx.status] || tx.status,
    tx.notes || '',
  ]);

  const csvContent = '\uFEFF' + [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8');
}

export function exportToJSON(transactions: TransactionWithRelations[], filename: string) {
  const data = transactions.map((tx) => ({
    date: tx.date,
    type: tx.type,
    type_ar: transactionTypeLabels[tx.type],
    account: tx.account?.name,
    amount: tx.amount,
    paid_amount: tx.paid_amount,
    category: tx.category?.name,
    bucket: tx.bucket,
    bucket_ar: bucketLabels[tx.bucket],
    status: tx.status,
    status_ar: statusLabels[tx.status],
    person: tx.person?.name,
    project: tx.project?.name,
    notes: tx.notes,
  }));

  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
