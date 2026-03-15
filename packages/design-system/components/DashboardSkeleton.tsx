interface DashboardSkeletonProps {
  variant?: "admin" | "default";
}

export function DashboardSkeleton({ variant = "default" }: DashboardSkeletonProps) {
  return (
    <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
      <div className="animate-pulse">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>

        {variant === "admin" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column skeleton */}
            <div className="flex flex-col gap-6">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            {/* Right column skeleton */}
            <div className="h-full bg-gray-200 rounded"></div>
          </div>
        )}
      </div>
    </div>
  );
}
