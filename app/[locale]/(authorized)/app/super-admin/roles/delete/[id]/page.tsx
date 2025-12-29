"use client";

import { DeleteUserModal } from "../../@modal/(.)delete/[id]/DeleteUserModal";
import { useRouter } from "next/navigation";

export default function DeleteUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const handleClose = () => {
    router.push("../..");
  };

  const handleDeleted = () => {
    // Se podría agregar lógica adicional aquí si es necesario
  };

  return <DeleteUserModal userId={params.id} onClose={handleClose} onDeleted={handleDeleted} />;
}
