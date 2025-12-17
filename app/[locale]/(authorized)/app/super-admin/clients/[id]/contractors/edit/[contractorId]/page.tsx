"use client";

import { useParams } from "next/navigation";
import { EditContractorModalWrapper } from "../../_components/EditContractorModalWrapper";

export default function ClientEditContractorPage() {
  const params = useParams<{ id: string; contractorId: string }>();
  const clientId = params?.id;
  const contractorId = params?.contractorId;
  if (!clientId || !contractorId) return null;

  return <EditContractorModalWrapper clientId={clientId} contractorId={contractorId} />;
}
