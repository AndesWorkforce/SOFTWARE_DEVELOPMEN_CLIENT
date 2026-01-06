"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { ContractorCalendarModal } from "./ContractorCalendarModal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContractorCalendarPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const handleClose = () => {
    router.back();
  };

  // TODO: Obtener el nombre del contractor desde la API o el estado
  // Por ahora usaremos un placeholder
  const contractorName = "Contractor"; // Placeholder

  return (
    <ContractorCalendarModal
      contractorId={id}
      contractorName={contractorName}
      onClose={handleClose}
    />
  );
}
