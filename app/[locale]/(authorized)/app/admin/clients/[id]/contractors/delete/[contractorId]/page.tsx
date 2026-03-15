"use client";

import { useParams } from "next/navigation";
import { DeleteContractorModalWrapper } from "../../_components/DeleteContractorModalWrapper";

export default function ClientDeleteContractorPage() {
  const params = useParams<{ id: string; contractorId: string }>();
  const clientId = params?.id;
  const contractorId = params?.contractorId;
  if (!clientId || !contractorId) return null;

  return <DeleteContractorModalWrapper clientId={clientId} contractorId={contractorId} />;
}
