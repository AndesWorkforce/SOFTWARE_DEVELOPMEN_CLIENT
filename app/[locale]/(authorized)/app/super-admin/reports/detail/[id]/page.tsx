"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ReportDetailView } from "@/packages/design-system";

function ReportDetailContent() {
  const params = useParams();
  const contractorId = params?.id as string;

  if (!contractorId) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] p-8 flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  return <ReportDetailView contractorId={contractorId} basePath="super-admin" />;
}

export default function ReportDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFFFF] p-8 flex items-center justify-center">
          <div className="text-black">Loading...</div>
        </div>
      }
    >
      <ReportDetailContent />
    </Suspense>
  );
}
