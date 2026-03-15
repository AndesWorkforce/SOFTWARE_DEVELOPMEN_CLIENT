"use client";

import { useRouter, useParams } from "next/navigation";
import { EditContractorModal } from "./EditContractorModal";

export default function EditContractorPage() {
  const router = useRouter();
  const params = useParams();
  const contractorId = params?.id as string;

  const handleClose = () => {
    router.back();
  };

  if (!contractorId) return null;

  return <EditContractorModal contractorId={contractorId} onClose={handleClose} />;
}
