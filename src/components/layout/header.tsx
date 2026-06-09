'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="app-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="header-actions">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: '13px' }}
        >
          {loading ? '...' : 'تسجيل خروج'}
        </button>
      </div>
    </div>
  );
}
