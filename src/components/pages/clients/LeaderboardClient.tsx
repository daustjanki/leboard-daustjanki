"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { LeaderboardPage } from "@/components/pages/LeaderboardPage";
import type { Student, MasterGoal, AssignedGoal } from "@/lib/types";

interface Props {
  students: Student[];
  masterGoals: MasterGoal[];
  appSettings?: any;
}

export default function LeaderboardClient({ students, masterGoals, appSettings = {} }: Props) {
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

  const navigateTo = (path: string, params: any = {}) => {
    if (path === "/student" && params.id) router.push(`/student/${params.id}`);
    else router.push(path);
  };

  return (
    <LeaderboardPage
      students={students}
      masterGoals={masterGoals}
      calculateTotalPoints={calculateTotalPoints}
      navigateTo={navigateTo}
      isLoading={false}
      appSettings={appSettings}
    />
  );
}
