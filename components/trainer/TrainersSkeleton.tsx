export default function TrainersSkeleton() {
  return (
    <div className="animate-pulse flex flex-col w-full max-w-md mx-auto">
      {/* Trainer cards skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border-b border-gray-200 p-4 bg-white">
          <div className="flex mb-3 gap-4">
            <div className="flex-1">
              <div className="h-[11px] bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-[12px] bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex-1">
              <div className="h-[11px] bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-[20px] bg-gray-200 rounded w-20"></div>
            </div>
          </div>

          <div className="mb-3">
            <div className="h-[11px] bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-[12px] bg-gray-200 rounded w-32"></div>
          </div>

          <div className="mb-3">
            <div className="h-[11px] bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-[12px] bg-gray-200 rounded w-28"></div>
          </div>

          {/* Action buttons skeleton */}
          <div className="flex gap-2 mt-4">
            <div className="h-[14px] w-[14px] bg-gray-200 rounded-full"></div>
            <div className="h-[14px] w-[14px] bg-gray-200 rounded-full"></div>
            <div className="h-[14px] w-[14px] bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

