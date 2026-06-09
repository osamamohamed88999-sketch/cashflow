import Header from '@/components/layout/header';
import { getDashboardStats } from '@/lib/actions/dashboard';
import { getCommitmentsWithStatus } from '@/lib/actions/commitments';
import { getCycleMonth } from '@/lib/utils';
import DashboardClient from './dashboard-client';

export const revalidate = 0; // Disable server caching to ensure live balance modifications are instant

const monthNamesArabic = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export default async function DashboardPage() {
  const currentDate = new Date();
  const currentMonthStr = getCycleMonth(currentDate);
  
  // Extract month index for Arabic naming (e.g. "2026-06" -> June)
  const monthParts = currentMonthStr.split('-');
  const monthIndex = monthParts.length === 2 ? parseInt(monthParts[1], 10) - 1 : currentDate.getMonth();
  const currentMonthName = monthNamesArabic[monthIndex] || '';

  // Parallel data fetching for performance
  const [stats, commitments] = await Promise.all([
    getDashboardStats(),
    getCommitmentsWithStatus(),
  ]);

  return (
    <>
      <Header title="لوحة التحكم" subtitle="إدارة رصيدك البنكي والتزاماتك التلقائية بكل سهولة" />
      <DashboardClient 
        stats={stats} 
        commitments={commitments} 
        currentMonthName={currentMonthName} 
      />
    </>
  );
}
