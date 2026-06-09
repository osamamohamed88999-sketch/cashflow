import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import ToastProvider from '@/components/ui/toast-provider';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Digi Whale Money Control | إدارة مالية احترافية',
  description: 'نظام إدارة مالية شخصي وتجاري احترافي - تتبع الرصيد، المصروفات، الدخل، والالتزامات الشهرية',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full" style={{ fontFamily: 'var(--font-cairo), Cairo, sans-serif' }}>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
