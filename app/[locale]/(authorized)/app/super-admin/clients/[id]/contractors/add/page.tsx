"use client";

import { useParams } from "next/navigation";
import { AddContractorModalWrapper } from "../_components/AddContractorModalWrapper";

export default function ClientAddContractorPage() {
  const params = useParams<{ id: string }>();
  const clientId = params?.id;
  if (!clientId) return null;

  return <AddContractorModalWrapper clientId={clientId} />;
}
