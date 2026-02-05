"use client";

import { useParams } from "next/navigation";
import { ReportDetailView } from "@/packages/design-system";

export default function ReportDetailPage() {
  const params = useParams();
  const contractorId = params?.id as string;

  return <ReportDetailView contractorId={contractorId} basePath="super-admin" />;
}
