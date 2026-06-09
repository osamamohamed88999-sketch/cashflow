import Header from '@/components/layout/header';
import { getCategories } from '@/lib/actions/categories';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
  const categories = await getCategories();

  return (
    <>
      <Header title="الإعدادات" subtitle="إدارة التصنيفات والفئات" />
      <SettingsClient categories={categories} />
    </>
  );
}
