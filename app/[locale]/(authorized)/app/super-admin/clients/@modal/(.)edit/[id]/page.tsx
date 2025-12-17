"use client";

import { useRouter, useParams } from "next/navigation";
import { EditClientModal } from "./EditClientModal";

export default function EditClientModalPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;

  const handleClose = () => {
    router.back();
  };

  if (!clientId) return null;

  return <EditClientModal clientId={clientId} onClose={handleClose} />;
}
