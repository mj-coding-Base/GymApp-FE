import Dashboard from "@/components/dashboard/Dashboard";
import { fetchDashboardData } from "@/actions/dashboard";
import { getSession } from "@/lib/authentication";

export default async function DashboardWrapper() {
  try {
    const data = await fetchDashboardData();
    
    if (!data) {
      console.error("Received empty response from server");
      return <div>No data available</div>;
    }
    const userData = await getSession();
    console.log( "Print user name",userData?.user.name);
    console.log( "Print user email",userData?.user.email);
    console.log( "Print user id",userData?.user.id);

    console.log("API response received:", {
      hasTrainerData: !!data.trainer,
      hasClientData: !!data.client,
      hasPaymentHistory: !!data.paymentHistory,
    });

    return (
      <Dashboard 
        data={data} 
        userName={userData?.user.name ?? ""}
      />
    );

  } catch (err: unknown) {
    console.error("Error fetching dashboard data:", err);
    
    const errorMessage = err instanceof Error 
      ? err.message 
      : "Failed to fetch dashboard data";

    return <div>Error: {errorMessage}</div>;
  }
}