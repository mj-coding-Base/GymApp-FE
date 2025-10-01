export default function PackagesSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Search bar skeleton */}
      <div className="flex px-1 py-0 gap-2 mb-2 pl-3 pr-3">
        <div className="h-[44px] flex-1 bg-gray-200 rounded-[24px]"></div>
      </div>

      {/* Add button skeleton */}
      <div className="px-3 mb-3">
        <div className="h-[40px] w-full bg-gray-200 rounded-[10px]"></div>
      </div>

      {/* Package cards skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border border-b border-gray-200 p-2 bg-white mb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex gap-7 mb-3">
                <div>
                  <div className="h-[11px] bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-[12px] bg-gray-200 rounded w-24"></div>
                </div>
                <div>
                  <div className="h-[11px] bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-[12px] bg-gray-200 rounded w-20"></div>
                </div>
                <div>
                  <div className="h-[11px] bg-gray-200 rounded w-28 mb-2"></div>
                  <div className="h-[12px] bg-gray-200 rounded w-32"></div>
                </div>
              </div>

              <div className="flex gap-14 mb-3">
                <div>
                  <div className="h-[11px] bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-[12px] bg-gray-200 rounded w-12"></div>
                </div>
                <div>
                  <div className="h-[11px] bg-gray-200 rounded w-12 mb-2"></div>
                  <div className="h-[12px] bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-[35px] w-[120px] bg-gray-200 rounded-[11px]"></div>
              </div>
            </div>

            {/* Edit button skeleton */}
            <div className="h-[20px] w-[20px] bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

