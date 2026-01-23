"use client";

import { useParams } from "next/navigation";
import { AddContractorModalWrapper } from "../../../contractors/_components/AddContractorModalWrapper";

export default function ClientAddContractorModalRoute() {
  const params = useParams<{ id: string }>();
  const clientId = params?.id;
  if (!clientId) return null;

  return <AddContractorModalWrapper clientId={clientId} />;
}
