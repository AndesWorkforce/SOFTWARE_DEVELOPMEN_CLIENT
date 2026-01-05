"use client";

import { useRouter, useParams } from "next/navigation";
import { DeleteUserModal } from "./DeleteUserModal";

export default function DeleteUserModalPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const handleClose = () => {
    router.back();
  };

  if (!userId) return null;

  return <DeleteUserModal userId={userId} onClose={handleClose} />;
}
