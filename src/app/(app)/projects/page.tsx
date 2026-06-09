import Header from '@/components/layout/header';
import { getProjects } from '@/lib/actions/projects';
import { AddProjectButton, ProjectRow } from './project-actions';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <Header title="المشاريع" subtitle="تتبع مشاريع Digi Whale" />
      <AddProjectButton />

      {projects.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon">📁</div>
          <h3>لا توجد مشاريع</h3>
          <p>أضف أول مشروع لـ Digi Whale</p>
        </div>
      ) : (
        <div className="table-wrap" style={{ marginTop: 20 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>المشروع</th>
                <th>العميل</th>
                <th>الحالة</th>
                <th>الإيراد المتوقع</th>
                <th>المحصل</th>
                <th>المصاريف</th>
                <th>صافي الربح</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <ProjectRow key={p.id} project={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
