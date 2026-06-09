import Header from '@/components/layout/header';
import { getPeople } from '@/lib/actions/people';
import { AddPersonButton, PersonCard } from './people-actions';

export default async function PeoplePage() {
  const people = await getPeople();

  return (
    <>
      <Header title="الأشخاص" subtitle="إدارة الموظفين والفريلانسرز" />
      <AddPersonButton />

      {people.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon">👥</div>
          <h3>لا يوجد أشخاص</h3>
          <p>أضف موظفين أو فريلانسرز</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 20 }}>
          {people.map((p) => (
            <PersonCard key={p.id} person={p} />
          ))}
        </div>
      )}
    </>
  );
}
