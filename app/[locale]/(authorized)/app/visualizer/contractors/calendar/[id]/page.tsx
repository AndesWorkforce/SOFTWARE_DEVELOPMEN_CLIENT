"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { ContractorCalendarModal } from "@/app/[locale]/(authorized)/app/admin/contractors/@modal/(.)calendar/[id]/ContractorCalendarModal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VisualizerContractorCalendarPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const handleClose = () => {
    router.push(`/app/visualizer/contractors`);
  };

  const contractorName = "Contractor";

  return (
    <ContractorCalendarModal
      contractorId={id}
      contractorName={contractorName}
      onClose={handleClose}
    />
  );
}
