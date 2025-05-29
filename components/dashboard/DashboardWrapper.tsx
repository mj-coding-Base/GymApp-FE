import Dashboard from "@/components/dashboard/Dashboard";
import { fetchDashboardData } from "@/actions/dashboard";

export default async function DashboardWrapper() {
  try {
    const data = await fetchDashboardData();
    
    if (!data) {
      console.error("Received empty response from server");
      return <div>No data available</div>;
    }

    console.log("API response received:", {
      hasTrainerData: !!data.trainer,
      hasClientData: !!data.client,
      hasPaymentHistory: !!data.paymentHistory,
    });

    return (
      <Dashboard 
        data={data} 
        userName="User"  
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