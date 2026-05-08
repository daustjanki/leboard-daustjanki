import StudentProfileClient from "@/components/pages/clients/StudentProfileClient";
import { getLeaderboardBundle, getTopStudentIds } from "@/lib/firebase/serverFetch";

// Phase D: full RSC + ISR for student profiles.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await getTopStudentIds(30);
  return rows.map((r) => ({ id: r.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { students, masterGoals, categories, groups } = await getLeaderboardBundle();
  return (
    <StudentProfileClient
      studentId={id}
      students={students}
      masterGoals={masterGoals}
      categories={categories}
      groups={groups}
    />
  );
}
