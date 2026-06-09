'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const mainNav: NavItem[] = [
  { href: '/', label: 'لوحة التحكم', icon: '📊' },
  { href: '/accounts', label: 'الحسابات', icon: '🏦' },
  { href: '/transactions/add', label: 'إضافة معاملة', icon: '➕' },
  { href: '/transactions', label: 'المعاملات', icon: '📋' },
];

const financeNav: NavItem[] = [
  { href: '/commitments', label: 'الالتزامات الشهرية', icon: '📅' },
  { href: '/targets', label: 'الأهداف والميزانية', icon: '🎯' },
];

const businessNav: NavItem[] = [
  { href: '/digi-whale', label: 'Digi Whale', icon: '🐋' },
  { href: '/projects', label: 'المشاريع', icon: '📁' },
  { href: '/people', label: 'الأشخاص', icon: '👥' },
];

const systemNav: NavItem[] = [
  { href: '/reports', label: 'التقارير', icon: '📈' },
  { href: '/settings', label: 'الإعدادات', icon: '⚙️' },
];

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="nav-section">
      <div className="nav-section-title">{title}</div>
      {items.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn('nav-link', isActive && 'active')}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🐋</div>
        <h1>
          Digi Whale
          <span>Money Control</span>
        </h1>
      </div>

      <NavSection title="الرئيسية" items={mainNav} />
      <NavSection title="المالية" items={financeNav} />
      <NavSection title="الأعمال" items={businessNav} />
      <NavSection title="النظام" items={systemNav} />

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: '12px',
          borderTop: '1px solid var(--color-border)',
          marginTop: '8px',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}
      >
        Digi Whale Money Control v1.0
      </div>
    </aside>
  );
}
