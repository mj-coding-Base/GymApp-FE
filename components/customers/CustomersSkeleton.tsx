export default function CustomersSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-4 border-b pb-2">
        <div className="h-[36px] w-[110px] bg-gray-200 rounded"></div>
        <div className="h-[36px] w-[110px] bg-gray-200 rounded"></div>
      </div>

      {/* Search and filters skeleton */}
      <div className="mb-4 space-y-3">
        <div className="h-[44px] bg-gray-200 rounded-[24px]"></div>
        <div className="flex gap-2">
          <div className="h-[36px] w-[100px] bg-gray-200 rounded"></div>
          <div className="h-[36px] w-[100px] bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Customer cards skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-[15px] p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Avatar skeleton */}
                <div className="w-[40px] h-[40px] bg-gray-200 rounded-full"></div>
                
                {/* Text skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="h-[16px] bg-gray-200 rounded w-[60%]"></div>
                  <div className="h-[12px] bg-gray-200 rounded w-[40%]"></div>
                </div>
              </div>
              
              {/* Action button skeleton */}
              <div className="h-[32px] w-[80px] bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center mt-6 gap-2">
        <div className="h-[32px] w-[32px] bg-gray-200 rounded"></div>
        <div className="h-[32px] w-[32px] bg-gray-200 rounded"></div>
        <div className="h-[32px] w-[32px] bg-gray-200 rounded"></div>
        <div className="h-[32px] w-[32px] bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

