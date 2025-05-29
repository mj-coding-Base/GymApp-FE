"use client";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import AddNewPackage from "@/components/packages/AddNewPackage";
import UpdatePackage from "@/components/packages/UpdatePackage";
import CustomPagination from "@/components/common/CustomPagination";
import { getPackages, getPackageMembers } from "@/actions/package";
import { Loader2 } from "lucide-react";
import { PackageData } from "@/types/Packages";
import { MemberData } from "@/types/Packages";

export default function PackagePage() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState<
    "All" | "Individual" | "Group"
  >("All");
  const [packages, setPackages] = React.useState<PackageData[]>([]);
  const [members, setMembers] = React.useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = React.useState({
    packages: true,
    members: false,
  });

  // Fetch packages on component mount
  React.useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(prev => ({...prev, packages: true}));
      try {
        const data = await getPackages();
        setPackages(data);
      } catch (error) {
        console.error("Error loading packages:", error);
      } finally {
        setIsLoading(prev => ({...prev, packages: false}));
      }
    };

    fetchPackages();
  }, []);

  // Fetch members when drawer opens
  const handleOpenMembersDrawer = async (packageId: string) => {
    setIsDrawerOpen(true);
    setIsLoading(prev => ({...prev, members: true}));
    
    try {
      const data = await getPackageMembers(packageId);
      setMembers(data);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setIsLoading(prev => ({...prev, members: false}));
    }
  };

  const filteredMembers =
    selectedFilter === "All"
      ? members
      : members.filter((member) => member.clientType === selectedFilter);

  return (
    <div className="w-full">
      <Card className="py-3 mt-2">
        <CardContent className="pl-0 pr-0">
          <div className="flex px-1 py-0 gap-2 mb-2 pl-3 pr-3">
            <div className="relative flex-1">
              <i className="search-icon absolute left-3 top-3 h-[12.8px] w-[12.8px] text-[#9E9E9E]" />
              <Input
                className="pl-8 pr-4 rounded-[24px] text-[#9E9E9E] text-[12px] "
                placeholder="Search by Full name/ NIC"
              />
            </div>

            <Dialog>
              <DialogContent>
                <DialogTitle></DialogTitle>
              </DialogContent>
            </Dialog>
          </div>

          <AddNewPackage onPackageAdded={() => getPackages().then(setPackages)} />
          
          {isLoading.packages ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg.id}
                className="border border-b border-gray-200 p-2 bg-white relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex gap-9 mb-3">
                      <div>
                        <p className="text-[11px] text-gray-500">Date Created</p>
                        <p className="text-[12px] font-medium">
                          {pkg.dateCreated}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500">Package Name</p>
                        <p className="text-[12px] font-medium">
                          {pkg.packageName}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-14 mb-3">
                      <div>
                        <p className="text-[11px] text-gray-500">Sessions</p>
                        <p className="text-[12px] font-medium">{pkg.sessions}</p>
                      </div>
                      <Button
                        className="bg-[#6BBD78] px-2 text-black py-2 rounded-[11px] flex items-center w-[134px] h-[35px]"
                        onClick={() => handleOpenMembersDrawer(pkg.id)}
                      >
                        <span className="text-[13px] mr-2">Members</span>
                        <span className="text-[13px] font-bold">
                          {pkg.members}
                        </span>
                      </Button>
                    </div>
                  </div>

                  <UpdatePackage packageId={pkg.id} onPackageUpdated={() => getPackages().then(setPackages)} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="flex flex-col max-h-[115vh] overflow-y-auto">
          <DrawerHeader className="flex-shrink-0 border-b px-4">
            <DrawerClose asChild>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-[11px] w-[11px] bg-[#ffff] border-none"
                >
                  <i className="back-icon size-[20.5px]" />
                </Button>
                <span className="text-[11px]">Back</span>
              </div>
            </DrawerClose>
            <DrawerTitle className="text-[16px] font-semibold text-center mb-2">
              Member List
            </DrawerTitle>

            <div className="relative flex-1 mb-2">
              <i className="search-icon absolute left-3 top-3 h-[12.8px] w-[12.8px] text-[#9E9E9E]" />
              <Input
                className="pl-8 pr-4 rounded-[24px] text-[#9E9E9E] text-[12px] "
                placeholder="Search by Full name/ NIC"
              />
            </div>

            <div className="flex justify-between mb-0">
              {["All", "Individual", "Group"].map((filter) => (
                <Button
                  key={filter}
                  onClick={() =>
                    setSelectedFilter(filter as "All" | "Individual" | "Group")
                  }
                  className={`rounded-[10px] px-6 ${
                    selectedFilter === filter
                      ? "bg-[#378644] text-white"
                      : "bg-gray-100 text-[#545454]"
                  }`}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </DrawerHeader>

          <div className="flex-1 px-4 overflow-y-auto">
            {isLoading.members ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="border-b border-gray-200 py-4 last:border-b-0"
                >
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-[11px] text-[#6D6D6D]">
                        Date Registered
                      </p>
                      <p className="text-[12px] text-[#434745]">
                        {member.dateRegistered}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#6D6D6D]">Client Name</p>
                      <p className="text-[12px] text-[#434745]">
                        {member.clientName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-[11px] text-[#6D6D6D]">
                        Current Session
                      </p>
                      <p className="text-[12px] text-[#434745]">
                        {member.currentSession}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#6D6D6D]">Client Type</p>
                      <span
                        className={`inline-block px-4 py-1 rounded-[36px] text-[12.5px] ${
                          member.clientType === "Individual"
                            ? "bg-[#BBC2FF] text-[#122DBC]"
                            : "bg-[#CDEDFF] text-[#005F95]"
                        }`}
                      >
                        {member.clientType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#6D6D6D]">NIC</p>
                    <p className="text-[12px] text-[#434745]">{member.nic}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex-shrink-0 border-t p-4">
            <CustomPagination
              totalCount={members.length}
              className="flex items-center justify-center gap-2"
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
