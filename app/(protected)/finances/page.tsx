import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const FinancesPage = () => {
  return (
    <div className="w-full max-w-md ">
      <div className="flex space-x-2 pb-4">
        <Link href={"/finances/trainer-salaries"} className="flex-1">
          <Card className="flex-1 p-0">
            <CardContent className="flex items-center justify-center h-[105px] ">
              <span className="text-[#5D5D5D] font-medium text-[14px] text-center">
                Trainer Salaries
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href={"/finances/client-payments"} className="flex-1">
          <Card className="flex-1 p-0">
            <CardContent className="flex items-center justify-center h-[105px] ">
              <span className="text-[#5D5D5D] font-medium text-[14px] text-center">
                Client Payments
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex-col space-y-3">
        <Card className="p-0 gap-0 h-[130.4px] ">
          <CardHeader className="p-[12px] pb-0">
            <div className="flex gap-1 items-center">
              <i className="chart-icon size-[22.5px] 3xl:size-[30px] text-[#0A7117]" />
              <CardTitle className="text-[#0A7117] font-medium text-[12.8px]">
                Overall Earnings
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 py-2">
            <div className="bg-[#F7F7F8] p-5 rounded-lg flex justify-center items-center h-[76.8px]">
              <span className="text-[#0A7117] text-[19.2px] font-[700]">
                50000 LKR
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-0 gap-0 h-[130.4px]">
          <CardHeader className="p-[12px] pb-0">
            <div className="flex gap-1 items-center">
              <i className="chart-icon size-[22.5px] 3xl:size-[30px] text-[#EB5F14]" />
              <CardTitle className="text-[#EB5F14] font-medium text-[12.8px] ">
                Trainer Pending Payments
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 py-2">
            <div className="bg-[#F7F7F8] p-5 rounded-lg flex justify-center items-center  h-[76.8px]">
              <span className="text-[#EB5F14] text-[19.2px] font-[700]">
                50000 LKR
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-0 gap-0 h-[130.4px]">
          <CardHeader className="p-[12px] pb-0">
            <div className="flex gap-1 items-center">
              <i className="chart-icon size-[22.5px] 3xl:size-[30px] text-[#FF9500]" />
              <CardTitle className="text-[#FF9500] font-medium text-[12.8px] leading-[14.4px] tracking-[0px]">
                Client Pending Payments
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 py-2">
            <div className="flex gap-3">
              <div className="bg-[#F7F7F7] h-[76.8px] rounded-lg flex-1 flex flex-col items-center justify-center">
                <span className="text-[#454545] text-[11.2px] mb-0">
                  Individual
                </span>
                <span className="text-[#FF9500] text-[19.2px] font-bold">
                  200000 LKR
                </span>
              </div>
              <div className="bg-[#F7F7F7]  rounded-lg flex-1 flex flex-col items-center justify-center">
                <span className="text-[#454545] text-[11.2px] mb-0">Group</span>
                <span className="text-[#FF9500] text-[19.2px] font-bold">
                  300000 LKR
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancesPage;
