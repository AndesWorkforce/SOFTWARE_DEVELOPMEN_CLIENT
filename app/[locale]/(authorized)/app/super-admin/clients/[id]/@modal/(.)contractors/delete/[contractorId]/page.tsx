"use client";

import { useParams } from "next/navigation";
import { DeleteContractorModalWrapper } from "../../../../contractors/_components/DeleteContractorModalWrapper";

export default function ClientDeleteContractorModalRoute() {
  const params = useParams<{ id: string; contractorId: string }>();
  const clientId = params?.id;
  const contractorId = params?.contractorId;
  if (!clientId || !contractorId) return null;

  return <DeleteContractorModalWrapper clientId={clientId} contractorId={contractorId} />;
}
