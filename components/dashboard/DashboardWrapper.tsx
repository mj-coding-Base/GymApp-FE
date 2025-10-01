import { getSession } from "@/lib/authentication";
import DashboardClient from "./DashboardClient";

export default async function DashboardWrapper() {
  // Only get user session (fast operation, no blocking API calls)
  let userName = "User";

  try {
    const userData = await getSession();
    userName = userData?.user.name ?? "User";
  } catch (err) {
    console.error("Error getting user session:", err);
  }

  // Client component will immediately show cached data (instant load!),
  // then fetch fresh data in the background
  return <DashboardClient userName={userName} />;
}