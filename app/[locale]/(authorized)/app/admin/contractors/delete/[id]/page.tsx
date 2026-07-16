"use client";

import { useParams } from "next/navigation";
import {
  DeleteContractorModal,
  useContractorsListClose,
} from "@/packages/shared-views/contractors";

export default function DeleteContractorPage() {
  const params = useParams();
  const contractorId = params?.id as string;
  const handleClose = useContractorsListClose("admin");

  if (!contractorId) return null;

  return <DeleteContractorModal contractorId={contractorId} onClose={handleClose} />;
}
