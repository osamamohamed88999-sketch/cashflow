import Header from '@/components/layout/header';
import { getAccounts } from '@/lib/actions/accounts';
import { getCategories } from '@/lib/actions/categories';
import { getProjects } from '@/lib/actions/projects';
import { getPeople } from '@/lib/actions/people';
import TransactionForm from './transaction-form';

export default async function AddTransactionPage() {
  const [accounts, categories, projects, people] = await Promise.all([
    getAccounts(),
    getCategories(),
    getProjects(),
    getPeople(),
  ]);

  return (
    <>
      <Header title="إضافة معاملة" subtitle="سجل دخل، مصروف، تحويل، أو تسوية" />
      <TransactionForm
        accounts={accounts}
        categories={categories}
        projects={projects}
        people={people}
      />
    </>
  );
}
