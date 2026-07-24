import { Skeleton, SkeletonText } from "@/core/components/ui/Skeleton";

export default function CampaignDetailsSkeleton() {
  return (
    <main className="flex-1 flex flex-col overflow-hidden h-screen bg-slate-50/50">
      <div className="flex-1 overflow-y-auto space-y-6">
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 w-full">
            <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
            
            {/* Textos */}
            <div className="space-y-3 w-full max-w-md pt-2">
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
              
              <div className="pt-2">
                <SkeletonText lines={2} />
              </div>
            </div>
          </div>
          
          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* Tabs & Table Skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-96">
          {/* Tabs header */}
          <div className="px-6 py-4 border-b border-slate-200 flex gap-8">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-6 w-32 rounded" />
          </div>
          
          {/* Table rows */}
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
          </div>
        </div>

      </div>
    </main>
  );
}