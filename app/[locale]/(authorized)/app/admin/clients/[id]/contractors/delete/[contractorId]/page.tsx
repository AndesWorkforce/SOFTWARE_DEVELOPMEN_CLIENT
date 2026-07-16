"use client";

import { useParams } from "next/navigation";
import { DeleteContractorModalWrapper } from "@/packages/shared-views/contractors";

export default function ClientDeleteContractorPage() {
  const params = useParams<{ id: string; contractorId: string }>();
  const clientId = params?.id;
  const contractorId = params?.contractorId;
  if (!clientId || !contractorId) return null;

  return (
    <DeleteContractorModalWrapper clientId={clientId} contractorId={contractorId} role="admin" />
  );
}
