export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col gap-[20px]">
        {/* Welcome section skeleton */}
        <div>
          <div className="h-[18px] bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-[12px] bg-gray-200 rounded w-64"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-2 gap-[20px]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[15px] p-4 shadow-sm">
              <div className="h-[14px] bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-[32px] bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-white rounded-[15px] p-4 shadow-sm">
          <div className="h-[16px] bg-gray-200 rounded w-40 mb-4"></div>
          <div className="h-[200px] bg-gray-100 rounded"></div>
        </div>

        {/* Action buttons skeleton */}
        <div className="grid grid-cols-2 gap-[15px]">
          {[1, 2].map((i) => (
            <div key={i} className="h-[120px] bg-gray-200 rounded-[15px]"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

