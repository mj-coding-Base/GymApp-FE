import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinancesSkeleton() {
  return (
    <div className="w-full px-4 py-2">
      <Skeleton className="h-8 w-48 mb-4" />
      <Card className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}

