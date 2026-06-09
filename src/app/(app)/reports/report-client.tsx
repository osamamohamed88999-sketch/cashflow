'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { exportToCSV, exportToJSON } from '@/lib/export';
import type { TransactionWithRelations } from '@/types/database';

interface Props {
  transactions: TransactionWithRelations[];
  month: string;
  bucket?: string;
}

export default function ReportClient({ transactions, month, bucket }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/reports?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        type="month"
        className="form-input"
        style={{ width: 180 }}
        defaultValue={month}
        onChange={(e) => updateFilter('month', e.target.value)}
        dir="ltr"
      />
      <select
        className="form-select"
        style={{ width: 150 }}
        defaultValue={bucket || ''}
        onChange={(e) => updateFilter('bucket', e.target.value)}
      >
        <option value="">الكل</option>
        <option value="personal">شخصي</option>
        <option value="digi_whale">Digi Whale</option>
      </select>

      <div style={{ flex: 1 }} />

      <button
        className="btn btn-secondary btn-sm"
        onClick={() => exportToCSV(transactions, `report-${month}`)}
        disabled={transactions.length === 0}
      >
        📥 تصدير CSV
      </button>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => exportToJSON(transactions, `report-${month}`)}
        disabled={transactions.length === 0}
      >
        📥 تصدير JSON
      </button>
    </div>
  );
}
