"use client";

import { useRouter, useParams } from "next/navigation";
import { DeleteContractorModal } from "./DeleteContractorModal";

export default function DeleteContractorPage() {
  const router = useRouter();
  const params = useParams();
  const contractorId = params?.id as string;

  const handleClose = () => {
    router.back();
  };

  if (!contractorId) return null;

  return <DeleteContractorModal contractorId={contractorId} onClose={handleClose} />;
}
