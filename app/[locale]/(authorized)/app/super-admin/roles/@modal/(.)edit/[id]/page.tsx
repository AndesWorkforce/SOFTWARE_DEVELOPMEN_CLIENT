"use client";

import { useRouter, useParams } from "next/navigation";
import { EditUserModal } from "./EditUserModal";

export default function EditUserModalPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const handleClose = () => {
    router.back();
  };

  if (!userId) return null;

  return <EditUserModal userId={userId} onClose={handleClose} />;
}
