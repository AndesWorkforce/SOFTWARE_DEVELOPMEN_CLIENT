"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { EditUserModal } from "./EditUserModal";

export default function EditUserModalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const handleClose = () => {
    router.back();
  };

  const handleUpdated = () => {
    // Se podría agregar lógica adicional aquí si es necesario
  };

  return <EditUserModal userId={id} onClose={handleClose} onUpdated={handleUpdated} />;
}
