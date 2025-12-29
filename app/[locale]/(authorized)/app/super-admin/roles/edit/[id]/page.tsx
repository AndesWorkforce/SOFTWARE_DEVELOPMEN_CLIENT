"use client";

import { EditUserModal } from "../../@modal/(.)edit/[id]/EditUserModal";
import { useRouter } from "next/navigation";

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const handleClose = () => {
    router.push("../..");
  };

  const handleUpdated = () => {
    // Se podría agregar lógica adicional aquí si es necesario
  };

  return <EditUserModal userId={params.id} onClose={handleClose} onUpdated={handleUpdated} />;
}
