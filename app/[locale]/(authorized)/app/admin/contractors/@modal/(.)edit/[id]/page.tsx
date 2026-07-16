"use client";

import { useParams } from "next/navigation";
import { EditContractorModal, useContractorsListClose } from "@/packages/shared-views/contractors";

export default function EditContractorPage() {
  const params = useParams();
  const contractorId = params?.id as string;
  const handleClose = useContractorsListClose("admin");

  if (!contractorId) return null;

  return <EditContractorModal contractorId={contractorId} onClose={handleClose} />;
}
