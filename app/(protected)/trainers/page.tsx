"use client";
import { AdminGuard } from "@/components/common/AdminGuard";
import TrainerInfo from "@/components/trainer/TrainerInfo";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default function ClientPaymentsPage() {
  return (
    <AdminGuard>
      <div className="">
        <div>
          <Card className="py-3 mt-2">
            <CardContent className="flex-col pl-0 pr-0">
              <div className="flex w-full justify-between p-2 mb-1 bg-[#F6F6F6]">
                <div className=" flex items-center justify-center  text-[10.8px] text-[#757575]  ">
                  <i className="edit-new-icon bg-[#44424D] h-[14.4px] w-[14.4px] rounded-full" />
                  <span> : Edit</span>
                </div>
                <div className="flex items-center justify-center text-[10.8px] text-[#757575] ">
                  <i className="update-icon bg-[#44424D] h-[14.4px] w-[14.4px] rounded-full" />
                  <span> : Payment History</span>
                </div>
                <div className="flex items-center justify-center text-[10.8px] text-[#757575] ">
                  <i className="history-icon bg-[#44424D] h-[14.4px] w-[14.4px] rounded-full" />
                  <span> : Session History</span>
                </div>
              </div>

              <TrainerInfo />

              <div></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
