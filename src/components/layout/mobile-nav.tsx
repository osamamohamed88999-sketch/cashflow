'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const mobileItems = [
  { href: '/', label: 'الرئيسية', icon: '📊' },
  { href: '/transactions', label: 'المعاملات', icon: '📋' },
  { href: '/transactions/add', label: 'إضافة', icon: '➕' },
  { href: '/digi-whale', label: 'الأعمال', icon: '🐋' },
  { href: '/reports', label: 'التقارير', icon: '📈' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav">
      {mobileItems.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn('mobile-nav-item', isActive && 'active')}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
