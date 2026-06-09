'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/transactions?${params.toString()}`);
  };

  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
      <input
        type="month"
        className="form-input"
        style={{ width: 180 }}
        defaultValue={searchParams.get('month') || currentMonth}
        onChange={(e) => updateFilter('month', e.target.value)}
        dir="ltr"
      />

      <select
        className="form-select"
        style={{ width: 150 }}
        defaultValue={searchParams.get('type') || ''}
        onChange={(e) => updateFilter('type', e.target.value)}
      >
        <option value="">كل الأنواع</option>
        <option value="income">دخل</option>
        <option value="expense">مصروف</option>
        <option value="transfer">تحويل</option>
        <option value="adjustment">تسوية</option>
      </select>

      <select
        className="form-select"
        style={{ width: 150 }}
        defaultValue={searchParams.get('bucket') || ''}
        onChange={(e) => updateFilter('bucket', e.target.value)}
      >
        <option value="">الكل</option>
        <option value="personal">شخصي</option>
        <option value="digi_whale">Digi Whale</option>
      </select>
    </div>
  );
}
