"use client";

import { useRouter } from "next/navigation";
import { DeleteUserModal } from "./DeleteUserModal";

export default function DeleteUserModalPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleDeleted = () => {
    // Se podría agregar lógica adicional aquí si es necesario
  };

  return <DeleteUserModal userId={params.id} onClose={handleClose} onDeleted={handleDeleted} />;
}
