import LeaderboardClient from "@/components/pages/clients/LeaderboardClient";
import { getLeaderboardBundle } from "@/lib/firebase/serverFetch";

// Phase D: full RSC. Server-fetch students+goals once, hand to a thin client island.
export const revalidate = 300;

export default async function Page() {
  const { students, masterGoals } = await getLeaderboardBundle();
  return <LeaderboardClient students={students} masterGoals={masterGoals} />;
}
