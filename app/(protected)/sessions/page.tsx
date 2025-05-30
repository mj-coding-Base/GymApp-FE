"use client";

import { getAllSessions } from "@/actions/session";
import { CalendarForm } from "@/components/common/CalendarForm";
import { useSession } from "@/components/providers/SessionProvider";
import GroupSessions from "@/components/sessions/group";
import IndividualSessions from "@/components/sessions/individual";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types/Customer";
import React, { useState } from "react";

// Dummy data generators


const SessionsPage = () => {
  const session = useSession();
  const [groups, setGroups] = React.useState<Customer[]>([]);
  const [individuals, setIndividuals] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("individual");
  const [usingDummyData, setUsingDummyData] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token) {
        const error = new Error("No authentication token found in session");
        console.error("[Customers] Authentication error:", {
          message: error.message,
          sessionAvailable: !!session,
          tokenAvailable: !!session?.user?.token,
          time: new Date().toISOString()
        });
        setError(error.message);
        setLoading(false);
        return;
      }

 try{
    const individualSessions = await getAllSessions({
    customer_type: 'individual'
  });
    console.log(individualSessions)
 }
 catch(error){
  console.log(error)
 }
    };

    fetchData();
  }, [session]);

  if (loading) {
    return (
      <div className="max-w-md space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card className="p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      {usingDummyData && (
        <div className="bg-yellow-100 text-yellow-800 p-2 mb-2 rounded text-sm">
          Warning: Using demo data. {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b-[1.8px] border-[#E7E7E7]">
          <TabsList className="p-0 h-auto text-[13.5px]">
            <TabsTrigger
              value="individual"
              className={`flex-1 py-2 rounded-none w-[110px] ${
                activeTab === "individual"
                  ? "text-[13.5px] text-[#F04237] border-b-2 border-b-[#F04237]  data-[state=active]:bg-transparent data-[state=active]:text-[#F04237] data-[state=active]:shadow-none"
                  : "text-[#424242] data-[state=active]:bg-transparent"
              }`}
            >
              Individual
            </TabsTrigger>
            <TabsTrigger
              value="group"
              className={`flex-1 py-2 rounded-none w-[87px] ${
                activeTab === "group"
                  ? "text-[13.5px] text-[#F04237] border-b-2 border-b-[#F04237]  data-[state=active]:bg-transparent data-[state=active]:text-[#F04237] data-[state=active]:shadow-none"
                  : "text-[#424242] data-[state=active]:bg-transparent"
              }`}
            >
              Group
            </TabsTrigger>
          </TabsList>
        </div>

        <Card className="py-3 mt-2">
          <CardContent className="pl-0 pr-0">
            <div className="">
              <div className="flex px-3 py-0 gap-4 mb-2">
                <div className="relative flex-1">
                  <i className="search-icon absolute left-3 top-3 h-[12.8px] w-[12.8px] text-[#9E9E9E]" />
                  <Input
                    className="pl-8 pr-4 rounded-[24px] text-[#9E9E9E] text-[12px]"
                    placeholder="Search by Full name/ NIC"
                  />
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-[36.8px] w-[36.8px]"
                    >
                      <i className="calender-icon  h-[18px] w-[18px] " />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-left text-[14px]">
                        Pick Date Range
                      </DialogTitle>
                    </DialogHeader>
                    <CalendarForm />
                  </DialogContent>
                </Dialog>
              </div>

              <TabsContent value="individual" className="mt-0">
                <IndividualSessions clients={individuals} />
              </TabsContent>

              <TabsContent value="group" className="mt-0">
                <GroupSessions members={groups} />
              </TabsContent>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default SessionsPage;