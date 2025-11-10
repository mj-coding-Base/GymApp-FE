"use client";

export default function EquipmentSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="border border-b border-gray-200 p-2 bg-white animate-pulse"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <div className="flex gap-7">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-300 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-300 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-300 rounded" />
                </div>
              </div>
              <div className="flex gap-14">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-12 bg-gray-300 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-300 rounded" />
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-5 w-5 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

