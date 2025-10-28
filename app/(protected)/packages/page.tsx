"use client";
import { fetchIndividualCustomers } from "@/actions/customers";
import { fetchAllPackages, getPackages } from "@/actions/package";
import { AdminGuard } from "@/components/common/AdminGuard";
import CustomPagination from "@/components/common/CustomPagination";
import AddNewPackage from "@/components/packages/AddNewPackage";
import PackagesSkeleton from "@/components/packages/PackagesSkeleton";
import UpdatePackage from "@/components/packages/UpdatePackage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { packagesCache } from "@/lib/packagesCache";
import { IndividualCustomer } from "@/types/Customer";
import { Package } from "@/types/Packages";
import { Loader2 } from "lucide-react";
import * as React from "react";

export const dynamic = 'force-dynamic';

export default function PackagePage() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  
  // Initialize with cached data immediately for instant load!
  const [packages, setPackages] = React.useState<Package[]>(() => {
    return packagesCache.get() || [];
  });
  const [members, setMembers] = React.useState<IndividualCustomer[]>([]);
  const [isLoading, setIsLoading] = React.useState(() => ({
    packages: !packagesCache.get(), // Only show loading if no cache
    members: false,
  }));
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Fetch packages on component mount
  React.useEffect(() => {
    const fetchPackages = async () => {
      const hasCache = packagesCache.get() !== null;
      
      if (hasCache) {
        setIsRefreshing(true);
      } else {
        setIsLoading(prev => ({...prev, packages: true}));
      }

      try {
        const data = await fetchAllPackages();
        setPackages(data);
        // Cache the fresh data
        packagesCache.set(data);
      } catch (error) {
        console.error("Error loading packages:", error);
      } finally {
        setIsLoading(prev => ({...prev, packages: false}));
        setIsRefreshing(false);
      }
    };

    fetchPackages();
  }, []);

  // ⚡ PERFORMANCE: Memoize members count to avoid recomputation
  const [membersCount, setMembersCount] = React.useState<Record<string, number>>({});
  const PAGE_SIZE = 50; // Render 50 at a time instead of 1000

  const handleOpenMembersDrawer = async (packageId: string, page = 1) => {
    setIsDrawerOpen(true);
    setIsLoading(prev => ({ ...prev, members: true }));

    try {
      // ⚡ PERFORMANCE: Fetch paginated data instead of all 1000 items
      const data = await fetchIndividualCustomers(page.toString(), PAGE_SIZE.toString(), packageId);
      
      // Always replace members for now (pagination UI can be added later)
      setMembers(data.results);
      setMembersCount(prev => ({ ...prev, [packageId]: data.totalResults }));
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error loading members:", error);
      }
    } finally {
      setIsLoading(prev => ({ ...prev, members: false }));
    }
  };

  if (isLoading.packages) {
    return (
      <AdminGuard>
        <div className="w-full">
          <Card className="py-3 mt-2">
            <CardContent className="pl-0 pr-0">
              <PackagesSkeleton />
            </CardContent>
          </Card>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
    <div className="w-full relative">
      {/* Show subtle loading indicator when refreshing in background */}
      {isRefreshing && (
        <div className="absolute top-0 right-0 z-10">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <i className="loading-icon size-[14px] animate-spin" />
            <span className="text-xs text-gray-600">Updating...</span>
          </div>
        </div>
      )}

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
          
          {packages.map((pkg) => (
              <div
                key={pkg.packageId}
                className="border border-b border-gray-200 p-2 bg-white relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex gap-7 mb-3">
                      <div>
                        <p className="text-[11px] text-gray-500 max-w-[72]">Date Created</p>
                        <p className="text-[12px] font-medium">
                          {pkg.createdAt.slice(0,10)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 max-w-[50]">Package ID</p>
                        <p className="text-[12px] font-medium">
                          {pkg.packageId}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 ">Package Name</p>
                        <p className="text-[12px] font-medium">
                          {pkg.package_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-14 mb-3">
                      <div>
                        <p className="text-[11px] text-gray-500">Period</p>
                        <p className="text-[12px] font-medium">{pkg.durationDays}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500">Price</p>
                        <p className="text-[12px] font-medium">{pkg.price}</p>
                      </div>
                      <Button
                        className="bg-[#6BBD78] px-2 text-black py-2 rounded-[11px] flex items-center w-[120px] h-[35px]"
                        onClick={() => handleOpenMembersDrawer(pkg.packageId, 1)}
                      >
                        <span className="text-[13px] mr-2">Members</span>
                        <span className="text-[13px] font-bold">
                          ({membersCount[pkg.packageId] ?? 0})
                        </span>
                      </Button>

                    </div>
                  </div>

                  <UpdatePackage packageId={pkg.packageId} onPackageUpdated={() => getPackages().then(setPackages)} />
                </div>
              </div>
            ))
          }
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
              Member List ({members.length})
            </DrawerTitle>

            <div className="relative flex-1 mb-2">
              <i className="search-icon absolute left-3 top-3 h-[12.8px] w-[12.8px] text-[#9E9E9E]" />
              <Input
                className="pl-8 pr-4 rounded-[24px] text-[#9E9E9E] text-[12px] "
                placeholder="Search by Full name/ NIC"
              />
            </div>

            {/* <div className="flex justify-between mb-0">
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
            </div> */}
          </DrawerHeader>

          <div className="flex-1 px-4 overflow-y-auto">
            {isLoading.members ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member._id}
                  className="border-b border-gray-200 py-4 last:border-b-0"
                >
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-[11px] text-[#6D6D6D]">
                        Date Registered
                      </p>
                      <p className="text-[12px] text-[#434745]">
                        {member.createdAt.slice(0,10)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#6D6D6D]">Client Name</p>
                      <p className="text-[12px] text-[#434745]">
                        {member.firstName} {member.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-[11px] text-[#6D6D6D]">
                        Current Session
                      </p>
                      <p className="text-[12px] text-[#434745]">
                        {member.availableSessionQuota}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#6D6D6D]">Client Type</p>
                      <span
                        className={`inline-block px-4 py-1 rounded-[36px] text-[12.5px] ${
                          member.groupId == null
                            ? "bg-[#BBC2FF] text-[#122DBC]"
                            : "bg-[#CDEDFF] text-[#005F95]"
                        }`}
                      >
                        {
                          member.groupId == null
                            ? "Group"
                            : "Individual"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#6D6D6D]">User ID</p>
                    <p className="text-[12px] text-[#434745]">{member.clientId}</p>
                  </div>
                </div>
              )
            )
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
    </AdminGuard>
  );
}
