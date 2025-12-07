"use client";
import { fetchAllEquipment } from "@/actions/equipment";
import { AdminGuard } from "@/components/common/AdminGuard";
// import CustomPagination from "@/components/common/CustomPagination";
import AddNewEquipment from "@/components/equipment/AddNewEquipment";
import EquipmentSkeleton from "@/components/equipment/EquipmentSkeleton";
import UpdateEquipment from "@/components/equipment/UpdateEquipment";
// import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { equipmentCache } from "@/lib/equipmentCache";
import { Equipment, EquipmentStatus, EquipmentType } from "@/types/Equipment";
// import { Loader2 } from "lucide-react";
import * as React from "react";

export default function EquipmentPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Initialize with empty array to prevent hydration mismatch
  // Cache will be used after mount (client-side only)
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = React.useState({ equipment: true });
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Mark component as mounted (client-side only)
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch equipment on component mount
  React.useEffect(() => {
    if (!isMounted) return;

    const fetchEquipment = async () => {
      // Check cache only on client-side after mount
      const cachedData = equipmentCache.get();
      
      if (process.env.NODE_ENV === 'development') {
        console.log("🔍 [EquipmentPage] Cache check:", {
          hasCache: !!cachedData,
          cacheLength: cachedData?.length || 0,
        });
      }
      
      if (cachedData && cachedData.length > 0) {
        // Use cached data immediately for instant load
        setEquipment(cachedData);
        setIsRefreshing(true);
        if (process.env.NODE_ENV === 'development') {
          console.log("📦 [EquipmentPage] Using cached equipment:", cachedData.length, "items");
        }
      } else {
        setIsLoading(prev => ({...prev, equipment: true}));
      }

      try {
        // Fetch equipment from server
        if (process.env.NODE_ENV === 'development') {
          console.log("🔄 [EquipmentPage] Fetching equipment from server...");
        }
        
        const data = await fetchAllEquipment();
        // Ensure data is always an array
        const equipmentArray = Array.isArray(data) ? data : [];
        
        if (process.env.NODE_ENV === 'development') {
          console.log("📦 [EquipmentPage] Fetched equipment:", {
            count: equipmentArray.length,
            isArray: Array.isArray(data),
            rawDataType: typeof data,
            sample: equipmentArray[0] || null,
            allIds: equipmentArray.map(eq => eq._id || eq.equipmentId).slice(0, 5),
          });
        }
        
        setEquipment(equipmentArray);
        // Update client-side cache after successful fetch
        if (equipmentArray.length > 0) {
          equipmentCache.set(equipmentArray);
          if (process.env.NODE_ENV === 'development') {
            console.log("✅ [EquipmentPage] Cache updated with", equipmentArray.length, "items");
          }
        } else {
          // Clear cache if no data
          equipmentCache.clear();
          if (process.env.NODE_ENV === 'development') {
            console.warn("⚠️ [EquipmentPage] No equipment returned, cache cleared");
          }
        }
      } catch (error) {
        console.error("❌ [EquipmentPage] Error loading equipment:", error);
        if (process.env.NODE_ENV === 'development') {
          console.error("❌ [EquipmentPage] Error details:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
        }
        // Set empty array on error to prevent map errors
        setEquipment([]);
        equipmentCache.clear();
      } finally {
        setIsLoading(prev => ({...prev, equipment: false}));
        setIsRefreshing(false);
      }
    };

    fetchEquipment();
  }, [isMounted]);

  // Filter equipment based on search term
  const filteredEquipment = React.useMemo(() => {
    // Ensure equipment is always an array
    if (!Array.isArray(equipment)) {
      return [];
    }
    
    if (!searchTerm.trim()) {
      return equipment;
    }
    
    const term = searchTerm.toLowerCase();
    return equipment.filter((eq) => {
      return (
        eq.name?.toLowerCase().includes(term) ||
        eq.equName?.toLowerCase().includes(term) ||
        eq.equipmentId?.toLowerCase().includes(term) ||
        eq.model?.toLowerCase().includes(term) ||
        eq.brand?.toLowerCase().includes(term) ||
        eq.metadata?.description?.toLowerCase().includes(term)
      );
    });
  }, [equipment, searchTerm]);

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case EquipmentStatus.AVAILABLE:
        return "bg-[#6BBD78] text-white";
      case EquipmentStatus.MAINTENANCE:
        return "bg-[#FFA726] text-white";
      case EquipmentStatus.RETIRED:
        return "bg-[#EF5350] text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const formatEquipmentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading.equipment) {
    return (
      <AdminGuard>
        <div className="w-full">
          <Card className="py-3 mt-2">
            <CardContent className="pl-0 pr-0">
              <EquipmentSkeleton />
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
                  className="pl-8 pr-4 rounded-[24px] text-[#9E9E9E] text-[12px]"
                  placeholder="Search by name, ID, model, brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <AddNewEquipment onEquipmentAdded={() => fetchAllEquipment().then(setEquipment)} />
            
            {!Array.isArray(filteredEquipment) || filteredEquipment.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No equipment found matching your search" : "No equipment found"}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-gray-400">
                    Equipment array length: {Array.isArray(equipment) ? equipment.length : 'not an array'}
                    {isLoading.equipment && ' (Loading...)'}
                    {isRefreshing && ' (Refreshing...)'}
                  </div>
                )}
              </div>
            ) : (
              filteredEquipment.map((eq, index) => {
                // Ensure we have a valid key
                const key = eq._id || eq.equipmentId || `equipment-${index}`;
                if (!eq._id && !eq.equipmentId) {
                  console.warn("⚠️ Equipment missing both _id and equipmentId:", eq);
                }
                return (
                <div
                  key={key}
                  className="border-b border-gray-200 bg-white relative hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3 p-3">
                    <div className="flex-1 min-w-0">
                      {/* Header Section - Name and Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-semibold text-gray-900 mb-1 truncate">
                            {eq.name || eq.equName || 'Unnamed Equipment'}
                          </h3>
                          <p className="text-[11px] text-gray-500">
                            {eq.equipmentId || 'N/A'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap flex-shrink-0 ${getStatusColor(eq.status || eq.equipmentStatus || EquipmentStatus.AVAILABLE)}`}
                        >
                          {(eq.status || eq.equipmentStatus || EquipmentStatus.AVAILABLE).charAt(0).toUpperCase() + (eq.status || eq.equipmentStatus || EquipmentStatus.AVAILABLE).slice(1)}
                        </span>
                      </div>

                      {/* Main Info Grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-3">
                        <div>
                          <p className="text-[10px] text-gray-500 mb-0.5">Type</p>
                          <p className="text-[12px] font-medium text-gray-900">
                            {formatEquipmentType(eq.type || eq.equipmentType || 'unknown')}
                          </p>
                        </div>
                        {eq.muscleGroups && eq.muscleGroups.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-500 mb-0.5">Muscle Groups</p>
                            <p className="text-[12px] font-medium text-gray-900">
                              {eq.muscleGroups.slice(0, 2).map(g => g.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}
                              {eq.muscleGroups.length > 2 && ` +${eq.muscleGroups.length - 2}`}
                            </p>
                          </div>
                        )}
                        {(eq.brand || eq.model) && (
                          <div>
                            <p className="text-[10px] text-gray-500 mb-0.5">
                              {eq.brand && eq.model ? 'Brand & Model' : eq.brand ? 'Brand' : 'Model'}
                            </p>
                            <p className="text-[12px] font-medium text-gray-900">
                              {eq.brand && eq.model 
                                ? `${eq.brand} ${eq.model}` 
                                : eq.brand || eq.model || 'N/A'}
                            </p>
                          </div>
                        )}
                        {eq.quantityTotal !== undefined && eq.quantityTotal !== null && (
                          <div>
                            <p className="text-[10px] text-gray-500 mb-0.5">Total Quantity</p>
                            <p className="text-[12px] font-medium text-gray-900">{eq.quantityTotal}</p>
                          </div>
                        )}
                        {eq.quantityAvailable !== undefined && eq.quantityAvailable !== null && (
                          <div>
                            <p className="text-[10px] text-gray-500 mb-0.5">Available</p>
                            <p className="text-[12px] font-medium text-gray-900">{eq.quantityAvailable}</p>
                          </div>
                        )}
                        {eq.location && (eq.location.room || eq.location.zone) && (
                          <div>
                            <p className="text-[10px] text-gray-500 mb-0.5">Location</p>
                            <p className="text-[12px] font-medium text-gray-900">
                              {eq.location.room && eq.location.zone
                                ? `${eq.location.room} - ${eq.location.zone}`
                                : eq.location.room || eq.location.zone || 'N/A'}
                            </p>
                          </div>
                        )}
                        {eq.createdAt && (
                          <div>
                            <p className="text-[10px] text-gray-500 mb-0.5">Date Created</p>
                            <p className="text-[12px] font-medium text-gray-900">
                              {new Date(eq.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Metadata/Description (if available) */}
                      {eq.metadata?.description && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-1">Description</p>
                          <p className="text-[11px] text-gray-700 line-clamp-2 leading-relaxed">
                            {eq.metadata.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 pt-1">
                      <UpdateEquipment 
                        equipmentId={eq._id || eq.equipmentId}
                        initialData={{
                          name: eq.name || eq.equName || '',
                          type: eq.type || eq.equipmentType || EquipmentType.UNKNOWN,
                          muscleGroups: eq.muscleGroups || [],
                          model: eq.model || '',
                          brand: eq.brand || '',
                          location: eq.location || { room: undefined, zone: undefined },
                          quantityTotal: eq.quantityTotal || 1,
                          sku: eq.sku,
                          serialNumber: eq.serialNumber,
                          maintenanceIntervalDays: eq.maintenanceIntervalDays,
                        }}
                        onEquipmentUpdated={() => fetchAllEquipment().then(setEquipment)} 
                      />
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}

