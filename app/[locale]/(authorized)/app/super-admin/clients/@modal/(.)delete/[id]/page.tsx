"use client";

import { useRouter, useParams } from "next/navigation";
import { DeleteClientModal } from "./DeleteClientModal";

export default function DeleteClientModalPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;

  const handleClose = () => {
    router.back();
  };

  if (!clientId) return null;

  return <DeleteClientModal clientId={clientId} onClose={handleClose} />;
}
