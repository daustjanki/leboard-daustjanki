"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { StudentProfilePage as StudentProfileComponent } from "@/components/pages/StudentProfilePage";
import type { Student, MasterGoal, Category, Group, AssignedGoal } from "@/lib/types";

interface Props {
  studentId: string;
  students: Student[];
  masterGoals: MasterGoal[];
  categories: Category[];
  groups: Group[];
}

export default function StudentProfileClient({
  studentId,
  students,
  masterGoals,
  categories,
  groups,
}: Props) {
  const router = useRouter();

  const calculateTotalPoints = useCallback(
    (assignedGoals: AssignedGoal[]) => {
      if (!assignedGoals || !masterGoals) return 0;
      return assignedGoals.reduce((total, assigned) => {
        if (assigned.completed) {
          const goalData = masterGoals.find((mg) => String(mg.id) === String(assigned.goalId));
          if (goalData) {
            const pts =
              goalData.points !== undefined
                ? goalData.points
                : (goalData as any).pointValue || (goalData as any).pts || 0;
            const numPts = typeof pts === "number" ? pts : parseInt(String(pts), 10);
            return total + (isNaN(numPts) ? 0 : numPts);
          }
        }
        return total;
      }, 0);
    },
    [masterGoals],
  );

  const navigateTo = (path: string, navParams: any = {}) => {
    if (path === "/student" && navParams.id) router.push(`/student/${navParams.id}`);
    else router.push(path);
  };

  return (
    <StudentProfileComponent
      studentId={studentId}
      students={students}
      masterGoals={masterGoals}
      categories={categories}
      groups={groups}
      calculateTotalPoints={calculateTotalPoints}
      navigateTo={navigateTo}
    />
  );
}
