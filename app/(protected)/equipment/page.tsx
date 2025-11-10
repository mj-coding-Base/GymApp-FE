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
      
      if (cachedData && cachedData.length > 0) {
        // Use cached data immediately for instant load
        setEquipment(cachedData);
        setIsRefreshing(true);
      } else {
        setIsLoading(prev => ({...prev, equipment: true}));
      }

      try {
        // Fetch equipment from server
        const data = await fetchAllEquipment();
        // Ensure data is always an array
        const equipmentArray = Array.isArray(data) ? data : [];
        setEquipment(equipmentArray);
        // Update client-side cache after successful fetch
        if (equipmentArray.length > 0) {
          equipmentCache.set(equipmentArray);
        }
      } catch (error) {
        console.error("Error loading equipment:", error);
        // Set empty array on error to prevent map errors
        setEquipment([]);
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
        eq.equName?.toLowerCase().includes(term) ||
        eq.equipmentId?.toLowerCase().includes(term) ||
        eq.model?.toLowerCase().includes(term) ||
        eq.brand?.toLowerCase().includes(term) ||
        eq.description?.toLowerCase().includes(term)
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
              </div>
            ) : (
              filteredEquipment.map((eq) => (
                <div
                  key={eq.equipmentId || eq._id}
                  className="border-b border-gray-200 bg-white relative hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3 p-3">
                    <div className="flex-1 min-w-0">
                      {/* Header Section - Name and Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-semibold text-gray-900 mb-1 truncate">
                            {eq.equName || 'Unnamed Equipment'}
                          </h3>
                          <p className="text-[11px] text-gray-500">
                            {eq.equipmentId || 'N/A'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap flex-shrink-0 ${getStatusColor(eq.equipmentStatus || EquipmentStatus.AVAILABLE)}`}
                        >
                          {(eq.equipmentStatus || EquipmentStatus.AVAILABLE).charAt(0).toUpperCase() + (eq.equipmentStatus || EquipmentStatus.AVAILABLE).slice(1)}
                        </span>
                      </div>

                      {/* Main Info Grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-3">
                        <div>
                          <p className="text-[10px] text-gray-500 mb-0.5">Type</p>
                          <p className="text-[12px] font-medium text-gray-900">
                            {formatEquipmentType(eq.equipmentType || 'unknown')}
                          </p>
                        </div>
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
                            <p className="text-[10px] text-gray-500 mb-0.5">Quantity</p>
                            <p className="text-[12px] font-medium text-gray-900">{eq.quantityTotal}</p>
                          </div>
                        )}
                        {eq.cost !== undefined && eq.cost !== null && (
                          <div>
                            <p className="text-[10px] text-gray-500 mb-0.5">Cost</p>
                            <p className="text-[12px] font-medium text-gray-900">
                              ${Number(eq.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
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

                      {/* Description (if available) */}
                      {eq.description && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-1">Description</p>
                          <p className="text-[11px] text-gray-700 line-clamp-2 leading-relaxed">
                            {eq.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 pt-1">
                      <UpdateEquipment 
                        equipmentId={eq._id || eq.equipmentId}
                        initialData={{
                          equipmentType: eq.equipmentType || EquipmentType.UNKNOWN,
                          equName: eq.equName || '',
                          model: eq.model,
                          brand: eq.brand,
                          location: eq.location,
                          purchaseDate: eq.purchaseDate,
                          quantityTotal: eq.quantityTotal,
                          lastServicedAt: eq.lastServicedAt,
                          nextServiceDue: eq.nextServiceDue,
                          warranty: eq.warranty,
                          equipmentStatus: eq.equipmentStatus || EquipmentStatus.AVAILABLE,
                          cost: eq.cost,
                          description: eq.description,
                        }}
                        onEquipmentUpdated={() => fetchAllEquipment().then(setEquipment)} 
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}

